import * as path from "path"
import child_process from "child_process"
import { ChildProcess, type SpawnOptions } from "child_process"
import { type ServiceManager } from "./ServiceManager"
import { Logger } from "./Logger"
import fs, { WriteStream } from "fs"
import { http } from "follow-redirects"
import net from "net"
import EventEmitter from "eventemitter3"
import kill from "tree-kill"
import { os } from "./Utils"
import { unpackZip, unpackTarGz } from "@particle/unpack-file"
import pidusageTree from "pidusage-tree"
import findProcess from "find-process"

const COMMAND_LINE_COMMENT_PREFIX = "#"
const COMMAND_LINE_BACKGROUND_PROCESS_SUFFIX = "&"
const COMMAND_LINE_DIRECTCOMMAND_PREFIX = ";"
const COMMAND_LINE_ARGUMENT_SEPARATOR = " "

export interface CommandLine {
  commandLine: string // original command line
  exe: string // executableChildProcess
  cwd: string // cwd used
  includesExe: boolean // was exex extracted from comandline
  exeRelativeToCWD: boolean // has the exed been set relative to cwd
  parsed: boolean //have the args been parsed
  args: string[]
}

export interface ServiceConfig {
  servicehome: string
  servicepath: string
  servicesdataroot: string
  options: SericeConfigFile
  events: ServiceEvents
}

export interface ServiceEvents {
  sendServiceStatus: (id: string, output: any) => void
  sendServiceLog: (id: string, output: any) => void
}

export type ServiceEvent = {
  readonly status: (id: string, status: any) => void
  readonly log: (id: string, output: any) => void
  readonly globalEnv: (id: string, globalEnv: any) => void
}

export enum SignalType {
  SIGTERM = "SIGTERM",
  SIGKILL = "SIGKILL",
  SIGINT = "SIGINT",
}

export enum ServiceStatus {
  UNKNOWN = "-100",
  INVALIDCONFIG = "-10",
  ERROR = "-1",
  DISABLED = "0",
  LOADED = "1",
  ARCHIVED = "10",
  EXTRACTING = "15",
  EXTRACTED = "20",
  INSTALLING = "25",
  INSTALLED = "30",
  AVAILABLE = "50",
  STOPPING = "65",
  STOPCOMMANDSTART = "70",
  STOPCOMMANDEND = "75",
  STOPPED = "80",
  STARTING = "90",
  DEPENDENCIESWAIT = "100",
  DEPENDENCIESNOTREADY = "104",
  DEPENDENCIESREADY = "105",
  HEALTHCHECKWAIT = "110",
  STARTED = "120",
  COMPLETEDERROR = "200",
  COMPLETED = "220",
}

export enum ServiceType {
  SERVICE = 10,
  UTILITY = 50,
}

export enum ServiceLocation {
  LOCAL = "10",
  ONLINE = "20",
}

export enum HealthCheckType {
  HTTP = "http",
  TCP = "tcp",
}

export interface HealthCheck {
  type: HealthCheckType
  url?: string
  path?: string
  interval?: number
  timeout?: number
  retries?: number
  tcpport?: number
  tcphost?: string
  start_period?: number
  expected_status?: number
}

export interface CommandConfigEnvSubstitution {
  source: string
  target: string
}

export interface PlatfromCommandLine {
  win32?: string
  darwin?: string
  linux?: string
  default?: string
}

export interface ExecConfig {
  authentication?: Authentication
  execservice?: ExecService
  executable?: PlatfromCommandLine
  executablecli?: PlatfromCommandLine
  setuparchive?: {
    win32?: SetupArchive
    darwin?: SetupArchive
    linux?: SetupArchive
  }
  setup?: {
    win32?: string[]
    darwin?: string[]
    linux?: string[]
    default?: string[]
  }
  env?: any
  globalenv?: any
  commandline?: PlatfromCommandLine
  commandlinecli?: PlatfromCommandLine
  commandconfig?: CommandConfigEnvSubstitution
  datapath?: string
  serviceorder?: 99
  depend_on?: string[]
  serviceport?: number
  serviceportsecondary?: number
  serviceportconsole?: number
  serviceportdebug?: number
  servicehost?: string
  healthcheck?: HealthCheck
  debuglog?: boolean
  outputvarregex?: { [key: string]: string } // used to check values of console output stdout key is variable, value is regex
  ignoreexiterror?: boolean
  execshell?: boolean // run service in shell if its a full on server
  execcwd?: string //in which cwd to run the service commands
}

export interface SetupArchive {
  name: string
  output: string
}

export interface ExecService {
  id?: string
  cli?: boolean
}

export interface Authentication {
  username?: string
  password?: string
}

export interface ServiceActions {
  start: () => void
  stop: () => void
  restart: () => void
}

export enum ServiceActionsEnum {
  START = "start",
  STOP = "stop",
  RESTART = "restart",
}

export interface ServiceActionsConfig {
  start?: {
    commandline: PlatfromCommandLine
  }
  stop?: {
    commandline: PlatfromCommandLine
  }
  restart?: {
    commandline: PlatfromCommandLine
  }
}

export interface SericeConfigFile {
  id: string
  name?: string
  description?: string
  enabled?: boolean
  status?: ServiceStatus
  logoutput?: string
  icon?: string
  servicetype?: ServiceType
  servicelocation?: ServiceLocation
  execconfig: ExecConfig
  actions?: ServiceActionsConfig
}

export class Service extends EventEmitter<ServiceEvent> {
  #process?: ChildProcess
  #processStats: any
  #processStatsTree: any
  #processStatsTreeInfo: any
  #processStatsTimeout: any
  #processList?: string[]
  #id: string
  #name: string
  #description: string
  #servicehome: string
  #servicepath: string
  #servicebinpath: string
  #execservicepath = ""
  #servicedatapath: string
  #servicepidfile: string
  #servicesroot: string
  #options: SericeConfigFile
  #events: ServiceEvents
  #serviceport?: number = -1
  #serviceportsecondary?: number = -1
  #serviceportconsole?: number = -1
  #serviceportdebug?: number = -1
  #servicehost?: string
  #serviceManager: ServiceManager
  #stdout: WriteStream
  #stdoutLogFile: string
  #stderr: WriteStream
  #stderrLogFile: string
  #logger: Logger
  #healthCheck?: HealthCheck
  #setupstatefile: string
  #setup: string[]
  #setuparchiveOutputPath = ""
  #setuparchiveFile = ""
  #status: ServiceStatus = ServiceStatus.DISABLED
  #abortController: AbortController
  #logsDir: string
  #processEnv: { [key: string]: string } = {} // passed to process
  #globalEnv: { [key: string]: string } = {} // pass when service was created
  #healthCheckTimeout: any
  #debuglog: boolean
  #exitCode: number | null | undefined
  #exitSignal: NodeJS.Signals | null | undefined
  #serviceexecutable = "" //cache service executable
  #execshell = false //spawn process in shell
  #execcwd = "" //cwd to run the service commands default to service home
  constructor(
    logsDir: string,
    logger: Logger,
    servicehome: string,
    servicepath: string,
    servicedatapath: string,
    options: SericeConfigFile,
    events: ServiceEvents,
    serviceManager: ServiceManager
  ) {
    super()
    this.#options = options
    this.#abortController = new AbortController()
    this.#name = this.#options.name || this.#options.id
    this.#description = this.#options.description || ""
    this.#servicepath = servicepath
    this.#servicebinpath = servicepath
    this.#servicehome = servicehome
    this.#servicedatapath = servicedatapath
    // if server has datapath set ensure the sub path exist in the server data path
    if (this.#options.execconfig.datapath) {
      this.#servicedatapath = path.join(
        this.#servicedatapath,
        this.#options.execconfig.datapath
      )
      this.#ensurePath(this.#servicedatapath)
    }
    this.#logsDir = logsDir
    this.#events = events
    this.#serviceManager = serviceManager
    this.#id = this.#options.id
    this.#debuglog = this.#options.execconfig?.debuglog || false
    this.#servicehost = this.#options.execconfig?.servicehost || "localhost"
    this.#healthCheck = this.#options.execconfig?.healthcheck
    this.#execshell = this.#options.execconfig?.execshell || false
    this.#execcwd = this.#options.execconfig?.execcwd || ""
    this.#setup = this.getSetupForPlatfrom
    this.#setStatus(ServiceStatus.LOADED)
    if (this.#options.enabled === false) {
      this.#setStatus(ServiceStatus.DISABLED)
    }
    // create logger for service
    this.#logger = logger.forService(this.#id)
    // create stderr log file for service executable
    this.#stderrLogFile = path.join(logsDir, `${this.#id}-error.log`)
    this.#ensurePathToFile(this.#stderrLogFile)
    this.#stderr = fs.createWriteStream(this.#stderrLogFile, {
      flags: "a",
      mode: 0o666,
      autoClose: true,
      encoding: "utf8",
      highWaterMark: 100,
    })
    this.#stderr.on("error", (err) => {
      // this.#logger.error(err)
      this.#logWrite("erorr", JSON.stringify(err))
    })
    this.#stderr.on("open", () => {
      this.#logWrite("info", `log stderr open.`)
    })
    this.#stderr.on("finish", () => {
      this.#logWrite("info", `log stderr finished.`)
    })
    this.#errorWrite("info", `service error log ${this.#stderr.path}.`)
    this.#log(`service error log ${this.#stderr.path}`)

    // create stdout log file for service executable
    this.#stdoutLogFile = path.join(logsDir, `${this.#id}-console.log`)
    this.#ensurePathToFile(this.#stdoutLogFile)
    this.#stdout = fs.createWriteStream(this.#stdoutLogFile, {
      flags: "a",
      mode: 0o666,
      autoClose: true,
      encoding: "utf8",
      highWaterMark: 100,
    })
    this.#stdout.on("error", (err) => {
      // this.#logger.error(err)
      this.#logWrite("erorr", JSON.stringify(err))
    })
    this.#stdout.on("open", () => {
      this.#logWrite("info", `log stdout open.`)
    })
    this.#stdout.on("finish", () => {
      this.#logWrite("info", `log finished.`)
    })
    this.#logWrite("info", `service console log ${this.#stdout.path}.`)
    this.#log(`service console log ${this.#stdout.path}`)

    const config = options.execconfig
    if (config) {
      this.#serviceport = config.serviceport || -1
      this.#serviceportsecondary = config.serviceportsecondary || -1
      this.#serviceportconsole = config.serviceportconsole || -1
      this.#serviceportdebug = config.serviceportdebug || -1
    }

    this.#servicesroot = path.resolve(path.dirname(servicepath))

    // set service setup check, leave state file in the service home so that its removed on app update
    this.#setupstatefile = path.join(
      this.#servicehome,
      path.basename(this.#servicehome) + ".setup"
    )
    this.#ensurePathToFile(this.#setupstatefile)

    // set service pid and check if its not running, leave pid file in the service home so that its removed on app update
    this.#servicepidfile = path.join(
      this.#servicehome,
      path.basename(this.#servicehome) + ".pid"
    )
    this.#ensurePathToFile(this.#servicepidfile)

    // compile archive file if set
    if (this.hasSetupArchive) {
      const setupArchive = this.getArchiveForPlatform
      if (setupArchive) {
        this.#log(
          `service ${this.#id} archive ${setupArchive.name} with destination ${
            setupArchive.output
          }.`
        )
        this.#setuparchiveFile = path.join(this.#servicepath, setupArchive.name)
        this.#setuparchiveOutputPath = path.join(
          this.#servicehome,
          this.platform,
          setupArchive.output
        )
        this.#servicebinpath = this.#setuparchiveOutputPath
        this.#log(
          `service ${this.#id} archive file ${
            this.#setuparchiveFile
          } with output path ${this.#setuparchiveOutputPath}.`
        )
        // set status to archived if setuparchiveOutputPath does not exist
        if (!this.isSetup && !fs.existsSync(this.#setuparchiveOutputPath)) {
          this.#setStatus(ServiceStatus.ARCHIVED)
        }
      } else {
        this.#log(
          `service ${this.#id} archive config ${setupArchive} is invalid.`
        )
      }
    }

    if (this.#serviceport && this.#serviceport > 0) {
      this.#getOpenPort().then((port) => {
        this.#serviceport = isNaN(port) ? -2 : port
        this.#log(`service ${this.#id} resolved port ${this.#serviceport}.`)
      })
    }

    if (this.#serviceportconsole && this.#serviceportconsole > 0) {
      this.#getOpenConsolePort().then((port) => {
        this.#serviceportconsole = isNaN(port) ? -2 : port
        this.#log(
          `service ${this.#id} resolved console port ${
            this.#serviceportconsole
          }.`
        )
      })
    }

    if (this.#serviceportsecondary && this.#serviceportsecondary > 0) {
      this.#getOpenSecondaryPort().then((port) => {
        this.#serviceportsecondary = isNaN(port) ? -2 : port
        this.#log(
          `service ${this.#id} resolved secondary port ${
            this.#serviceportsecondary
          }.`
        )
      })
    }

    if (this.#serviceportdebug && this.#serviceportdebug > 0) {
      this.#getOpenDebugPort().then((port) => {
        this.#serviceportdebug = isNaN(port) ? -2 : port
        this.#log(
          `service ${this.#id} resolved debug port ${this.#serviceportdebug}.`
        )
      })
    }

    this.#log(
      `service ${this.#id} loaded with status ${this.#statusname(
        this.#status
      )}.`
    )
    const isSetup = this.isSetup
    this.#log(`is setup ${isSetup}.`)
    this.#checkRunning()
  }

  #statusname(statuscode: ServiceStatus): string {
    const valIndex = Object.values(ServiceStatus).indexOf(statuscode)
    if (valIndex > -1) {
      return Object.keys(ServiceStatus)[valIndex]
    }
    return ServiceStatus.UNKNOWN
  }

  get name(): string {
    return this.#name
  }

  get description(): string {
    return this.#description
  }

  get processid(): any {
    let pid: any = 0
    if (this.#process) {
      const processName = Object.getOwnPropertyNames(this.#process)
      if (processName.length > 0 && processName.indexOf("pid") > -1) {
        pid = this.#process.pid
      }
    }
    return pid
  }

  // return memory for main service process
  get memorybytes(): number {
    let memoryUsage = 0
    const pid = this.#process?.pid || 0

    if (pid > 0) {
      const processStats = this.#processStats || {}

      if (
        processStats &&
        Object.getOwnPropertyNames(processStats).indexOf("memory") > -1
      ) {
        memoryUsage = processStats.memory || 0
      }
    }
    return memoryUsage
  }

  // return memory for main service process and all its child processes
  get memorybytestotal(): number {
    let memoryUsage = 0
    const pid = this.#process?.pid || 0

    if (pid > 0) {
      if (
        this.#processStats &&
        Object.getOwnPropertyNames(this.#processStats).indexOf("memory") > -1
      ) {
        memoryUsage = this.#processStats.memory || 0
      }

      if (this.#processStatsTree) {
        let memorytotal = 0
        Object.getOwnPropertyNames(this.#processStatsTree).forEach((pid) => {
          if (this.#processStatsTree[pid]) {
            memorytotal += this.#processStatsTree[pid].memory
          }
        })
        memoryUsage = memorytotal
      }
    }
    return memoryUsage
  }

  get processtree(): string[] {
    return this.#processList || []
  }

  get setuparchiveOutputPath(): string {
    return this.#setuparchiveOutputPath
  }

  get setupstatefile(): string {
    return this.#setupstatefile
  }

  get username(): string {
    if (this.#options.execconfig?.authentication) {
      return this.#options.execconfig?.authentication?.username || ""
    }
    return ""
  }

  get password(): string {
    if (this.#options.execconfig?.authentication) {
      return this.#options.execconfig?.authentication?.password || ""
    }
    return ""
  }

  get execshell(): boolean {
    return this.#execshell
  }

  get execcwd(): string {
    return this.#getServiceCommand(this.#execcwd, this)
  }

  get servicetype(): ServiceType {
    return this.#options.servicetype || ServiceType.SERVICE
  }

  getActionForPlatform(action: string): string {
    if (this.#options.actions) {
      const platfromSpecificAction: string =
        this.#options.actions?.[action].commandline[this.platform]
      const platfromSpecificActionDefault: string =
        this.#options.actions?.[action].commandline?.default || ""
      return platfromSpecificAction || platfromSpecificActionDefault
    }
    return ""
  }

  get getExecutaleForPlatform(): string {
    if (this.#options.execconfig?.executable) {
      const platfromSpecificExecutable: string =
        this.#options.execconfig?.executable[this.platform]
      const platfromSpecificExecutableDefault: string =
        this.#options.execconfig?.executable?.default || ""
      return platfromSpecificExecutable || platfromSpecificExecutableDefault
    }
    return ""
  }

  get getSetupForPlatfrom(): string[] {
    if (this.#options.execconfig?.setup) {
      const platfromSpecificSetup: string[] =
        this.#options.execconfig?.setup[this.platform]
      const platfromSpecificSetupDefault: string[] =
        this.#options.execconfig?.setup?.default || []

      if (platfromSpecificSetup) {
        return platfromSpecificSetup
      } else if (platfromSpecificSetupDefault) {
        return platfromSpecificSetupDefault
      }
    }
    return []
  }

  get getSetupForPlatfromParsed(): string[] {
    return this.getSetupForPlatfrom.map((step) =>
      this.#getServiceCommand(step, this)
    )
  }

  get getArchiveForPlatform(): SetupArchive | undefined {
    if (this.#options.execconfig?.setuparchive) {
      const platfromSpecificArchive: SetupArchive =
        this.#options.execconfig?.setuparchive[this.platform]

      if (platfromSpecificArchive) {
        return platfromSpecificArchive
      }
    }
  }

  get hasSetupArchive(): boolean {
    // check if setuparchive is set
    if (this.#options.execconfig?.setuparchive) {
      //check if any of the configs have name and output set
      const platfromSpecificArchive = this.getArchiveForPlatform

      if (platfromSpecificArchive) {
        if (platfromSpecificArchive.name && platfromSpecificArchive.output) {
          return true
        }
      }
    }
    return false
  }

  #ensurePath(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  #ensurePathToFile(file: string) {
    this.#ensurePath(path.dirname(file))
  }

  // replace possible variables in a service command string
  #getServiceCommand(command: string, service: Service): string {
    // for each environment variable in environmentVariables
    // replace ${ENV_VAR} with the value of the environment variable
    // if this.#serviceManager.globalEnv is not empty

    // if command a null or undefined return empty string or its a number or it does not contain ${ return empty string
    if (!this.isStringHasVariables(command)) {
      return command
    }

    for (const [key, value] of Object.entries(this.#serviceManager.globalEnv)) {
      command = command.replaceAll(`\${${key}}`, value)
    }

    for (const [key, value] of Object.entries(this.#processEnv)) {
      command = command.replaceAll(`\${${key}}`, value)
    }

    return command
      .replaceAll("${PS}", this.isWindows ? ";" : ":") //path separator
      .replaceAll("${SERVICE_HOME}", service.#servicehome)
      .replaceAll(
        "${SERVICE_HOME_ESC}",
        this.isWindows
          ? service.#servicehome.replaceAll("\\", "\\\\")
          : service.#servicehome
      ) // escape backslashes for windows
      .replaceAll("${SERVICE_EXECUTABLE}", service.getServiceExecutable())
      .replaceAll(
        "${SERVICE_EXECUTABLE_HOME}",
        service.getServiceExecutable(true)
      )
      .replaceAll(
        "${SERVICE_EXECUTABLE_CLI}",
        service.getServiceExecutableCli()
      )
      .replaceAll("${SERVICE_PATH}", service.#servicepath)
      .replaceAll("${SERVICE_BIN_PATH}", service.#servicebinpath)
      .replaceAll("${EXEC_SERVICE_PATH}", service.#execservicepath)
      .replaceAll("${SERVICE_DATA_PATH}", service.#servicedatapath)
      .replaceAll(
        "${SERVICE_DATA_PATH_ESC}",
        this.isWindows
          ? service.#servicedatapath.replaceAll("\\", "\\\\")
          : service.#servicedatapath
      ) // escape backslashes for windows
      .replaceAll("${SERVICE_PORT}", service.#serviceport + "")
      .replaceAll(
        "${SERVICE_PORT_SECONDARY}",
        service.#serviceportsecondary + ""
      )
      .replaceAll("${SERVICE_PORT_CONSOLE}", service.#serviceportconsole + "")
      .replaceAll("${SERVICE_PORT_DEBUG}", service.#serviceportdebug + "")
      .replaceAll("${SERVICE_HOST}", service.#servicehost + "")
      .replaceAll("${SERVICE_LOG_PATH}", service.#logsDir + "")
      .replaceAll(
        "${SERVICE_LOG_PATH_ESC}",
        this.isWindows
          ? (service.#logsDir + "").replaceAll("\\", "\\\\")
          : service.#logsDir + ""
      )
      .replaceAll("${SERVICE_AUTH_USERNAME}", service.username)
      .replaceAll("${SERVICE_AUTH_PASSWORD}", service.password)
      .replaceAll("${SERVICE_PID_FILE}", service.#servicepidfile)
  }

  get environmentVariables(): { [key: string]: string } {
    return this.#processEnv || {}
  }

  isStringHasVariables(str: any): boolean {
    return str && typeof str === "string" && str.indexOf("${") > -1
  }

  compileEnvironmentVariables(args: { [key: string]: string } = {}): any {
    const envVar = {}
    // add this.environmentVariables into envVar
    Object.assign(envVar, this.#environmentVariables)
    // add this.environmentVariables into envVar
    Object.assign(envVar, this.#globalEnv)
    // if args is not empty add it to envVar
    if (args && Object.keys(args).length > 0) {
      // add this.globalEnvironmentVariables into envVar
      Object.assign(envVar, args)
    }
    this.#processEnv = envVar

    // update vars if they contain ${}
    for (const [key, value] of Object.entries(this.#processEnv)) {
      if (this.isStringHasVariables(value)) {
        // replace possible variables in value
        this.#processEnv[key] = this.#getServiceCommand(value, this)
      }
    }

    return this.#processEnv
  }

  #handleProcessOutput(log: string) {
    if (this.#options.execconfig?.outputvarregex) {
      const logVars: { [key: string]: string } = this.#extractVariablesFromLog(
        log.toString()
      )

      // if logVars is not empty
      if (Object.keys(logVars).length > 0) {
        // add logVars to this.#globalEnv to pass to other services
        this.#log(`extracted variables from log: ${JSON.stringify(logVars)}`)
        this.setGlobalEnvironmentVariables(logVars)
        this.emit("globalEnv", this.id, this.#globalEnv)
      }
    }
    this.#logWrite("info", log)
  }

  // for each log line check if it matches the regex from the config list of Key/Value list in #options.outputvarregex
  #extractVariablesFromLog(log: string): { [key: string]: string } {
    const envVars = {}
    if (this.#options.execconfig?.outputvarregex) {
      for (const [key, regex] of Object.entries(
        this.#options.execconfig?.outputvarregex
      )) {
        if (log && log != null && log !== "") {
          //if log is a buffer conver to text using String.fromCharCode
          if (Array.isArray(log)) {
            log = String.fromCharCode(...log)
          }
          const match = log.match(regex)
          if (match && match.length > 0) {
            envVars[key] = match[1]
          }
        }
      }
    }
    return envVars
  }

  /**
   * get service environment variables
   */
  get #environmentVariables() {
    // add default env vars
    const envVar = {
      SERVICE_HOME: this.#servicehome,
      SERVICE_EXECUTABLE: this.getServiceExecutable(),
      SERVICE_EXECUTABLE_HOME: this.getServiceExecutable(true),
      SERVICE_EXECUTABLE_CLI: this.getServiceExecutableCli(),
      SERVICE_PATH: this.#servicepath,
      EXEC_SERVICE_PATH: this.#execservicepath,
      SERVICE_DATA_PATH: this.#servicedatapath,
      SERVICE_PORT: this.#serviceport + "",
      SERVICE_PORT_SECONDARY: this.#serviceportsecondary + "",
      SERVICE_PORT_CONSOLE: this.#serviceportconsole + "",
      SERVICE_PORT_DEBUG: this.#serviceportdebug + "",
      SERVICE_HOST: this.#servicehost + "",
      SERVICE_LOG_PATH: this.#logsDir + "",
      SERVICE_AUTH_USERNAME: this.username,
      SERVICE_AUTH_PASSWORD: this.password,
      SERVICE_PID_FILE: this.#servicepidfile,
    }

    // for each attribute in envVar update is value
    const serviceEnvVar = this.#options.execconfig?.env || {}
    for (const key in serviceEnvVar) {
      if (serviceEnvVar[key]) {
        const value = serviceEnvVar[key]
        // handle array values
        if (Array.isArray(value)) {
          // for each value in array check if it contains ${} and replace it with the value
          for (let i = 0; i < value.length; i++) {
            if (this.isStringHasVariables(value[i])) {
              value[i] = this.#getServiceCommand(value[i], this)
            }
          }
          // if value is an array join with ; for windows and : for linux
          envVar[key] = value.join(this.isWindows ? ";" : ":")
        } else {
          //single value
          envVar[key] = this.#getServiceCommand(value, this)
        }
      }
    }

    return envVar
  }

  setGlobalEnvironmentVariables(args: { [key: string]: string } = {}) {
    // add this.globalEnvironmentVariables into envVar
    Object.assign(this.#globalEnv, args)
    this.compileEnvironmentVariables()
  }

  /**
   * get global environment variables this service emits
   */
  get globalEnvironmentVariables() {
    const envVar = {}
    // if this.#globalEnv is empty get it from execconfig
    const globalEnv =
      Object.keys(this.#globalEnv).length == 0
        ? this.#options.execconfig?.globalenv
        : this.#globalEnv

    //const globalEnv = this.#globalEnv || this.#options.execconfig?.globalenv
    // for each attribute in globalenv update is value
    const serviceEnvVar = globalEnv || {}
    for (const key in serviceEnvVar) {
      if (serviceEnvVar[key]) {
        const value = serviceEnvVar[key]
        // handle array values
        if (Array.isArray(value)) {
          // for each value in array check if it contains ${} and replace it with the value
          for (let i = 0; i < value.length; i++) {
            if (this.isStringHasVariables(value[i])) {
              value[i] = this.#getServiceCommand(value[i], this)
            }
          }
          // if value is an array join with ; for windows and : for linux
          envVar[key] = value.join(this.isWindows ? ";" : ":")
        } else {
          //single value
          envVar[key] = this.#getServiceCommand(value, this)
        }
      }
    }
    return envVar
  }

  /**
   * prepare service configs by subsitituting variables in service config template
   * @param source source template
   * @param target destination file
   * @param environmentVariables additional arguments to subsitute
   */
  #prepareConfigFile(source: string, target: string): boolean {
    const sourcePath: string = path.join(this.#servicehome, source)
    const targetPath: string = path.join(this.#servicehome, target)
    const sourcePathExist: boolean = fs.existsSync(sourcePath)

    if (!sourcePathExist) {
      this.#log(`can't find source file ${sourcePath}.`)
      return false
    }

    // read source file
    try {
      const data = fs.readFileSync(sourcePath, "utf8")
      try {
        // replace variables in source file
        const result = this.#getServiceCommand(data, this)
        // ensure target file esists
        this.#ensurePathToFile(targetPath)

        // write result to target file
        fs.writeFileSync(targetPath, result, "utf8")

        return true
      } catch (error) {
        this.#log(`error writing tagret file ${targetPath}`)
      }
    } catch (error) {
      this.#log(`error reading source file ${sourcePath}`)
    }

    return false
  }

  get setup() {
    const setupVar: string[] = []
    // for each attribute in setup get is value
    this.#setup.forEach((step) => {
      const value = this.#getServiceCommand(step, this)
      setupVar.push(value)
    })
    return setupVar
  }
  // get log(): Readable {
  //   return this.#consolelog
  // }

  get errorLogFile(): string {
    return this.#stderrLogFile
  }

  get consoleLogFile(): string {
    return this.#stdoutLogFile
  }

  get id(): string {
    return this.#id
  }

  get status(): string {
    return this.#status
  }

  get options(): SericeConfigFile {
    return this.#options
  }

  get isEnabled() {
    return this.#options.enabled
  }

  get isDebug() {
    return this.#debuglog
  }

  get isUtility() {
    return this.#options.servicetype === ServiceType.UTILITY
  }

  get isAvailable() {
    return (
      this.#status === ServiceStatus.AVAILABLE ||
      this.#status === ServiceStatus.INSTALLED ||
      this.#status === ServiceStatus.COMPLETED
    )
  }

  get isStarted() {
    return (
      this.#status === ServiceStatus.STARTED ||
      this.#status === ServiceStatus.COMPLETED
    )
  }

  get isStopped() {
    return this.#status === ServiceStatus.STOPPED
  }

  get isStarting() {
    return (
      this.#status === ServiceStatus.STARTING ||
      this.#status === ServiceStatus.DEPENDENCIESWAIT ||
      this.#status === ServiceStatus.DEPENDENCIESNOTREADY ||
      this.#status === ServiceStatus.DEPENDENCIESREADY ||
      this.#status === ServiceStatus.HEALTHCHECKWAIT
    )
  }

  get isInstalling() {
    return (
      this.#status === ServiceStatus.INSTALLING ||
      this.#status === ServiceStatus.EXTRACTING
    )
  }

  get isRunning() {
    if (this.#process) {
      return !this.#process.killed
    } else {
      return false
    }
  }
  get isDone() {
    return this.#status === ServiceStatus.COMPLETED
  }

  isDependantOnService(serviceid: string): boolean {
    if (
      this.#options.execconfig.depend_on &&
      this.#options.execconfig.depend_on.length > 0
    ) {
      return this.#options.execconfig.depend_on.includes(serviceid) || false
    }
    return false
  }

  get port() {
    return this.#serviceport
  }
  get portsecondary() {
    return this.#serviceportsecondary
  }
  get portconsole() {
    return this.#serviceportconsole
  }
  get isWindows() {
    return process.platform === "win32"
  }
  get isMacOS() {
    return process.platform === "darwin"
  }
  get isLinux() {
    return process.platform === "linux"
  }

  get platform(): string {
    return process.platform == "win32" ||
      process.platform == "darwin" ||
      process.platform == "linux"
      ? process.platform
      : "default"
  }
  #getSimpleInfo() {
    return {
      id: this.#id,
      name: this.#options.name,
      serviceport: this.#serviceport,
      servicepid: this.#process?.pid,
      description: this.#options.description,
      enabled: this.#options.enabled,
      status: this.#status,
      icon: this.#options.icon,
      servicetype: this.#options.servicetype,
      servicelocation: this.#options.servicelocation,
      servicepath: this.#servicepath,
      servicepidfile: this.#servicepidfile,
    }
  }

  // return simple object with service config
  public getSimple(): any {
    return Object.assign({}, this.#getSimpleInfo())
  }

  // return full object with service config
  public toString = (): string => {
    return JSON.stringify(Object.assign({}, this.#getSimpleInfo()), null, "  ")
  }

  #processCompleted(event: string, code: number, signal: NodeJS.Signals) {
    //if this servicetype is a utility service, the update service status to COMPLETEDOK
    this.#log(
      `service with type ${
        this.#options.servicetype
      } event ${event} exit code ${code} signal ${signal}, ${
        this.#options.execconfig?.ignoreexiterror ? "ignoring" : "not ignoring"
      }}`
    )
    if (this.isUtility) {
      if (code === 0 || this.#options.execconfig?.ignoreexiterror) {
        this.#setStatus(ServiceStatus.COMPLETED)
      } else {
        this.#setStatus(ServiceStatus.COMPLETEDERROR)
      }
    } else {
      this.#setStatus(ServiceStatus.STOPPED)
    }
  }

  // register process and run health check
  #register(process: ChildProcess) {
    this.#process = process

    if (process.pid) {
      this.#debug(`creating service pid for service ${this.#id}`)
      this.#createServicePidFile(this.#servicepidfile, process.pid)
    }
    this.#debug(`registering service exit event ${this.#id}`)
    process.on("data", (data) => {
      this.#logWrite("----", data)
    })
    // handle process close this will run always after exit or error
    process.on("close", (code: number, signal: NodeJS.Signals) => {
      this.#exitCode = code
      this.#exitSignal = signal
      this.#removeServicePidFile()
      this.#log(
        `process ${this.#id} with pid ${
          this.#process?.pid
        } closed, with exit code ${code} and signal ${signal}, service status is ${this.#statusname(
          this.#status
        )}`
      )
      this.#processCompleted("close", code, signal)
      this.#process = void 0
    })
    // handle process exit
    process.on("exit", (code: number, signal: NodeJS.Signals) => {
      this.#exitCode = code
      this.#exitSignal = signal
      this.#removeServicePidFile()
      this.#log(
        `process ${this.#id} with pid ${
          this.#process?.pid
        } exited, with exit code ${code} and signal ${signal}, service status is ${this.#statusname(
          this.#status
        )}`
      )
      this.#processCompleted("exit", code, signal)
      this.#process = void 0
    })
    // handle process error
    process.on("error", (err: Error) => {
      this.#exitCode = this.#process?.exitCode || 1
      this.#exitSignal = this.#process?.signalCode || "SIGUNUSED"
      this.#removeServicePidFile()
      this.#log(`process ${this.#id} errored.`)
      this.#log(err.toString())
      this.#log(
        `process ${this.#id} with pid ${
          this.#process?.pid
        } errored, with exit code ${
          this.#exitCode
        }, service status is ${this.#statusname(this.#status)}`
      )
      this.#processCompleted("error", this.#exitCode, this.#exitSignal)
      this.#process = void 0
    })
    // run health check if defined
    this.#debug(`service healtcheck is ${this.#healthCheck != null}`)
    if (this.#healthCheck) {
      this.#debug(`starting health check for service ${this.#id}`)
      this.#setStatus(ServiceStatus.HEALTHCHECKWAIT)
      this.#startHealthCheck(this.#healthCheck.retries || 10)
    }

    // start monitoring service
    // this.monitorService(5000)
  }

  async processStats() {
    const pid = this.#process?.pid || 0
    if (pid > 0) {
      // // get latest process stats
      // try {
      //   this.#processStats = await pidusage(pid)
      // } catch (err) {
      //   this.#log(`pidusage for process ${pid} errored.`)
      // }

      try {
        // get process stats tree
        this.#processStatsTree = await pidusageTree(pid)
      } catch (err) {
        this.#log(`pidusageTree for process ${pid} errored.`)
      }

      if (this.#processStatsTree) {
        // get main process stats
        // this.#processStats = this.#processStatsTree[pid]

        this.#processStatsTreeInfo = {}

        // for each named object in this.#processStatsTree find process info and add it as named object to this.#processStatsTreeInfo
        for (const cpid in this.#processStatsTree) {
          if (cpid) {
            const processStats = this.#processStatsTree[cpid]
            if (processStats) {
              const list = await findProcess("pid", cpid)
              this.#processStatsTreeInfo[cpid] = list[0]
            }
          }
        }

        const processList = Array<string>()

        // for each property get the pid and memory
        Object.getOwnPropertyNames(this.#processStatsTree).forEach((pid) => {
          const processStats = this.#processStatsTree[pid]
          let memory = "0"
          let name = "childprocess"
          if (processStats) {
            memory = (processStats.memory / 1048576).toFixed(0) || "0"
          }
          if (this.#processStatsTreeInfo[pid]) {
            const info = this.#processStatsTreeInfo[pid]
            if (info) {
              name = info.name
            }
          }
          processList.push(`${pid} ${name} ${memory}MB`)
        })
        this.#processList = processList
      }
    }
  }

  // monitor individual service
  monitorService = async (time) => {
    this.#processStatsTimeout = setTimeout(async () => {
      await this.processStats()
      this.monitorService(time)
    }, time)
  }

  // get service executable from options by platform
  getServiceExecutableRoot(): string {
    let serviceExecutable: any = ""
    if (this.#options && this.#options.execconfig) {
      // if service is being executed by another service
      if (this.#options.execconfig.execservice) {
        // find service executable
        const execservice: ExecService = this.#options.execconfig.execservice
        if (execservice.id) {
          const serviceExecutableService = this.#serviceManager.getService(
            execservice.id
          )
          serviceExecutable =
            serviceExecutableService?.getServiceExecutableRoot()
          return serviceExecutable
        } else {
          this.#log("ExecService as been defined but no id was found")
        }
      } else if (this.#options.execconfig.executable) {
        // if service is being executed by a file
        return this.#servicepath
      }
      if (serviceExecutable == null) {
        this.#log("could not determine service executable")
        // this.disable()
      }
    } else {
      this.#setStatus(ServiceStatus.INVALIDCONFIG)
      this.#log(
        `service is missing execconfig, service status is ${this.#statusname(
          this.#status
        )}`
      )
    }
    return serviceExecutable
  }

  // return cli command line
  getServiceCommandCli(silent = false): string {
    let serviceCommandCli = ""
    if (this.#options && this.#options.execconfig) {
      // if service is being executed by another service
      if (this.#options.execconfig.commandlinecli) {
        serviceCommandCli =
          this.#options.execconfig.commandlinecli[this.platform]
        if (serviceCommandCli == null) {
          serviceCommandCli =
            this.#options.execconfig.commandlinecli["default"] || ""
        }
        if (serviceCommandCli == "") {
          this.#warn("service commandlinecli is defined but is empty.")
        }
        // if service is being executed by a file, expand variables
        serviceCommandCli = this.#getServiceCommand(serviceCommandCli, this)
      } else {
        if (!silent) {
          this.#warn("service does not have cli commandline")
        }
      }
    } else {
      this.#setStatus(ServiceStatus.INVALIDCONFIG)
      if (!silent) {
        this.#log(
          `service is missing execconfig, service status is ${this.#statusname(
            this.#status
          )}`
        )
      }
    }
    return serviceCommandCli
  }

  getCommandLineArguments(
    commandLine: string,
    cwd: string,
    includesExe = true,
    exeRelativeToCWD = true,
    parse = true
  ): CommandLine {
    const commandLineClean = commandLine.trim()
    const commandLineArgs = commandLineClean.split(
      COMMAND_LINE_ARGUMENT_SEPARATOR
    )
    const commandLineParsed: CommandLine = {
      commandLine: commandLineClean,
      exe: "",
      cwd: cwd,
      includesExe: includesExe,
      exeRelativeToCWD: exeRelativeToCWD,
      parsed: parse,
      args: commandLineArgs,
    }
    // if includesExe is true, remove first argument and set it as exe
    if (includesExe) {
      commandLineParsed.exe = commandLineArgs.shift() + ""
      if (exeRelativeToCWD) {
        // get executable relative to cwd
        commandLineParsed.exe = this.#getExecCommandRelativeToCWD(
          commandLineParsed.exe,
          this.#servicepath + ""
        )
      }
    }
    // substitute expressions in arguments
    if (parse) {
      commandLineParsed.exe = this.#getServiceCommand(
        commandLineParsed.exe,
        this
      )
      commandLineParsed.args.forEach((arg, index) => {
        commandLineParsed.args[index] = this.#getServiceCommand(arg, this)
      })
    }
    return commandLineParsed
  }

  // return cli command line
  getServiceCommandArguments(parse = true, silent = false): string[] {
    let serviceCommand = ""
    if (this.#options && this.#options.execconfig) {
      // if service is being executed by another service
      if (this.#options.execconfig.commandline) {
        serviceCommand = this.#options.execconfig.commandline[this.platform]
        if (serviceCommand == null) {
          serviceCommand = this.#options.execconfig.commandline["default"] || ""
        }
        if (serviceCommand == "") {
          this.#warn("service commandline is defined but is empty.")
        }
        // if service is being executed by a file, expand variables
        if (parse) {
          const args = serviceCommand.split(COMMAND_LINE_ARGUMENT_SEPARATOR)
          args.forEach((arg, index) => {
            args[index] = this.#getServiceCommand(arg, this)
          })
          return args
        } else {
          return serviceCommand.split(COMMAND_LINE_ARGUMENT_SEPARATOR)
        }
      } else {
        if (!silent) {
          this.#warn("service does not have a commandline")
        }
      }
    } else {
      this.#setStatus(ServiceStatus.INVALIDCONFIG)
      if (!silent) {
        this.#log(
          `service is missing execconfig, service status is ${this.#statusname(
            this.#status
          )}`
        )
      }
    }
    return []
  }

  // return cli command line
  getServiceCommand(silent = false): string {
    let serviceCommand = ""
    if (this.#options && this.#options.execconfig) {
      // if service is being executed by another service
      if (this.#options.execconfig.commandline) {
        serviceCommand = this.#options.execconfig.commandline[this.platform]
        if (serviceCommand == null) {
          serviceCommand = this.#options.execconfig.commandline["default"] || ""
        }
        if (serviceCommand == "") {
          this.#warn("service commandline is defined but is empty.")
        }
        // if service is being executed by a file, expand variables
        serviceCommand = this.#getServiceCommand(serviceCommand, this)
      } else {
        if (!silent) {
          this.#warn("service does not have a commandline")
        }
      }
    } else {
      this.#setStatus(ServiceStatus.INVALIDCONFIG)
      if (!silent) {
        this.#log(
          `service is missing execconfig, service status is ${this.#statusname(
            this.#status
          )}`
        )
      }
    }
    return serviceCommand
  }

  // get service executable from options by platform
  getServiceExecutable(returnPath = false): string {
    let serviceExecutable: any = ""
    if (this.#serviceexecutable == "") {
      if (this.#options && this.#options.execconfig) {
        // if service is being executed by another service
        if (this.#options.execconfig.execservice) {
          // find service executable
          const execservice: ExecService = this.#options.execconfig.execservice
          if (execservice.id) {
            const serviceExecutableService = this.#serviceManager.getService(
              execservice.id
            )
            if (serviceExecutableService) {
              // get full path to executable service
              serviceExecutable = path.resolve(
                serviceExecutableService.#servicehome,
                serviceExecutableService.getServiceExecutable()
              )
            } else {
              this.#log(
                `service with id ${execservice.id} is missing in service manager.`
              )
            }
            // return serviceExecutable
          } else {
            this.#log("ExecService as been defined but no id was found")
          }
        } else if (this.#options.execconfig.executable) {
          // if service is being executed by a file
          serviceExecutable = this.#options.execconfig.executable[this.platform]
          if (serviceExecutable == null) {
            serviceExecutable =
              this.#options.execconfig.executable.default || ""
          }
          const hasSetupArchive = this.hasSetupArchive
          const platfromPath = hasSetupArchive ? this.platform : ""
          //compile full path to executable
          serviceExecutable = path.resolve(
            this.#servicehome,
            platfromPath,
            serviceExecutable
          )
          // return serviceExecutable
        }
        if (serviceExecutable == null) {
          this.#log("could not determine service executable")
          // this.disable()
        }
      } else {
        this.#setStatus(ServiceStatus.INVALIDCONFIG)
        this.#log(
          `service is missing execconfig, service status is ${this.#statusname(
            this.#status
          )}`
        )
      }

      // if serviceExecutable does not exist exsit gracefuly
      if (!fs.existsSync(serviceExecutable)) {
        this.#log(`service executable not found at ${serviceExecutable}`)
      }
      //cache service executable, to minimise amount of calls.
      this.#serviceexecutable = serviceExecutable
    } else {
      serviceExecutable = this.#serviceexecutable
    }

    if (returnPath) {
      return path.dirname(serviceExecutable)
    }
    return path.basename(serviceExecutable)
  }

  // get service executable cli from options by platform
  getServiceExecutableCli(): string {
    let serviceExecutableCli: any = ""
    if (this.#options && this.#options.execconfig) {
      // if service is being executed by another service
      if (this.#options.execconfig.execservice) {
        // find service executable
        const execservice: ExecService = this.#options.execconfig.execservice
        if (execservice.id) {
          const serviceExecutableService = this.#serviceManager.getService(
            execservice.id
          )
          // get full path to executable service
          serviceExecutableCli = path.resolve(
            serviceExecutableService.#servicehome,
            serviceExecutableService.getServiceExecutableCli()
          )
          //return serviceExecutable
        } else {
          this.#log("ExecService as been defined but no id was found")
        }
      } else if (this.#options.execconfig.executablecli) {
        // if service is being executed by a file
        serviceExecutableCli =
          this.#options.execconfig.executablecli[this.platform]
        if (serviceExecutableCli == null) {
          serviceExecutableCli =
            this.#options.execconfig.executablecli.default || ""
        }

        const hasSetupArchive = this.hasSetupArchive
        const platfromPath = hasSetupArchive ? this.platform : ""
        //compile full path to executable
        serviceExecutableCli = path.resolve(
          this.#servicehome,
          platfromPath,
          serviceExecutableCli
        )
        //return serviceExecutableCli
      }
      if (serviceExecutableCli == null) {
        this.#log("could not determine service executable")
        // this.disable()
      }
    } else {
      this.#setStatus(ServiceStatus.INVALIDCONFIG)
      this.#log(
        `service is missing execconfig, service status is ${this.#statusname(
          this.#status
        )}`
      )
    }
    return serviceExecutableCli
  }
  // set enable flag in options to false
  disable() {
    this.#options.enabled = false
  }

  // set enable flag in options to true
  enable() {
    this.#options.enabled = true
  }

  #stopHealthCheck() {
    if (this.#healthCheckTimeout) {
      clearTimeout(this.#healthCheckTimeout)
    }
  }

  // interval: 10s
  // retries: 60
  // start_period: 60s
  // start helth check and repeat until retries is 0
  #startHealthCheck(retries: number) {
    if (this.#healthCheck && (!this.isStarted || !this.isStopped)) {
      if (retries > 0) {
        this.#log(
          `health check retry ${retries} of ${
            this.#healthCheck?.retries
          } for service ${this.id}.`
        )
        const timeoutInterval = this.#healthCheck?.interval || 1000
        const nextRetry = retries - 1
        const result = this.#runHealthCheck()
        this.#log(`health check result ${result}.`)
        if (result == true) {
          this.#setStatus(ServiceStatus.STARTED)
          return
        }
        //try again in timeoutInterval
        this.#healthCheckTimeout = setTimeout(
          (nextRetry) => {
            this.#startHealthCheck(nextRetry)
          },
          timeoutInterval,
          nextRetry
        )
      } else {
        this.#log(
          `health check exited after ${
            this.#healthCheck?.retries
          } retries, service status is ${this.#statusname(this.#status)}`
        )
      }
    }
  }

  // run health check
  #runHealthCheck(): boolean {
    if (this.#healthCheck) {
      if (this.#healthCheck.type == HealthCheckType.HTTP) {
        return this.#runHealthCheckHttp()
      } else if (this.#healthCheck.type == HealthCheckType.TCP) {
        return this.#runHealthCheckTcp()
      }
    }
    return true
  }

  // run health check http
  #runHealthCheckHttp(): boolean {
    if (this.#healthCheck && this.#healthCheck.url) {
      const urlFixed = this.#getServiceCommand(this.#healthCheck.url, this)
      const url: URL = new URL(urlFixed)
      const expected_status = this.#healthCheck.expected_status || 200

      // this.#log(`http health check request ${url.hostname}; url ${url}`)

      try {
        const req = http.get(url, (res) => {
          if (res.statusCode == expected_status) {
            this.#setStatus(ServiceStatus.STARTED)
            this.#stopHealthCheck()
            this.#log(
              `http health check success, service status is ${this.#statusname(
                this.#status
              )}`
            )
          } else {
            this.#log(
              `http health check failed with status code ${
                res.statusCode
              }, service status is ${this.#statusname(this.#status)}`
            )
            return false
          }
        })
        req.on("error", (e) => {
          this.#debug(
            `http health check request failed with error ${e}, service status is ${this.#statusname(
              this.#status
            )}`
          )
          return false
        })
      } catch (error) {
        this.#log(
          `http could not execute health check error is ${error}, service status is ${this.#statusname(
            this.#status
          )}`
        )
        return false
      }
    }
    return true
  }

  // run health check tcp
  #runHealthCheckTcp(): boolean {
    if (this.#healthCheck && this.#serviceport) {
      let hostname = this.#servicehost
      const port = this.#serviceport
      if (hostname == "localhost") {
        hostname = "127.0.0.1"
      }
      const socket = net.createConnection(port, hostname, () => {
        this.#setStatus(ServiceStatus.STARTED)
        this.#stopHealthCheck()
        this.#log(
          `tcp health check success, service status ${this.#statusname(
            this.#status
          )}.`
        )
        socket.end()
        return true
      })
      socket.on("error", (error) => {
        this.#log(
          `tcp health check failed with error ${error}, service status ${
            this.#status
          }`
        )
        return false
      })
    }
    return true
  }

  // get an open port
  async #getOpenPort(): Promise<number> {
    const port = await this.#serviceManager.getOpenPort(
      this.#serviceport,
      this.#servicehost
    )
    return parseInt(port + "")
  }
  // get an open port
  async #getOpenConsolePort(): Promise<number> {
    const port = await this.#serviceManager.getOpenPort(
      this.#serviceportconsole,
      this.#servicehost
    )
    return parseInt(port + "")
  }
  // get an open port
  async #getOpenSecondaryPort(): Promise<number> {
    const port = await this.#serviceManager.getOpenPort(
      this.#serviceportsecondary,
      this.#servicehost
    )
    return parseInt(port + "")
  }
  // get an open port
  async #getOpenDebugPort(): Promise<number> {
    const port = await this.#serviceManager.getOpenPort(
      this.#serviceportdebug,
      this.#servicehost
    )
    return parseInt(port + "")
  }

  //if path has spaces then run process in windows does not work
  //our paths should be safe but where this project is is not safe
  #getExecCommandRelativeToCWD(command: string, cwd: string) {
    // return path.relative(cwd, command)
    // let commandFixed = command.replace(cwd, "." + path.sep)
    // if (!commandFixed.startsWith("." + path.sep)) {
    //   commandFixed = "." + path.sep + commandFixed
    // }

    return command.replace(cwd, "." + path.sep)
  }

  #getServiceExecCWD(serviceExecutablePath: string): string {
    let cwdPath = serviceExecutablePath
    // if service is being executed by another service set CWD to service home
    if (!this.#options.execconfig.executable) {
      cwdPath = this.#servicepath
    }
    // if service has config set CWD to config path
    if (this.#execcwd != "") {
      cwdPath = this.#getServiceCommand(this.#execcwd, this)
    }
    return cwdPath
  }

  // start service and store its process id in a file based on os type
  async start(
    globalenv: { [key: string]: string } = {},
    startchain: string[] = [this.id],
    waitfordependencies = true,
    forceInstall = false
  ): Promise<void> {
    //quick fail if disabled
    if (!this.isEnabled) {
      this.#logWrite(
        "info",
        `quick fail if disabled, isEnabled: ${this.isEnabled}.`
      )
      this.#log(`service ${this.#id} is disabled`)
      return
    }

    this.#logWrite(
      "info",
      `starting ${this.#statusname(this.#status)}, isStarted:${
        this.isStarted
      }, isStopped:${this.isStopped}`
    )

    //quick fail if already starting
    if (this.isStarting || this.isInstalling) {
      this.#logWrite(
        "info",
        `quick fail if already starting, isStarting:${this.isStarting}, isInstalling:${this.isInstalling}.`
      )
      this.#log(`service ${this.#id} is already starting.`)
      return
    }

    //quick fail already started
    if (this.isStarted) {
      this.#logWrite(
        "info",
        `quick fail already started, isStarted:${this.isStarted}, pid ${
          this.#process?.pid
        }.`
      )
      return
    }

    this.#logWrite(
      "info",
      `dependent services ${waitfordependencies}, ${
        this.#options.execconfig.depend_on
      }, count: ${this.#options.execconfig.depend_on?.length}.`
    )
    if (
      waitfordependencies &&
      this.#options.execconfig.depend_on &&
      this.#options.execconfig.depend_on.length > 0
    ) {
      this.#log(
        `waiting for dependent services ${this.#options.execconfig.depend_on}.`
      )
      this.#setStatus(ServiceStatus.DEPENDENCIESWAIT)

      this.#log(
        `waiting for dependant services for service ${
          this.#id
        } with passed variables ${JSON.stringify(globalenv)}`
      )

      // wait untill all depend_on services are started
      const depend_on_services_started =
        await this.#waitForDependOnServicesAsync(globalenv, startchain)

      this.#log(
        `waited for dependant services for service ${
          this.#id
        } with result ${depend_on_services_started}.`
      )

      if (!depend_on_services_started) {
        this.#log(`dependant services not started during wait, checking again.`)
      }

      // for each service id in startchain, output progress
      for (const serviceid of startchain) {
        //skip self
        if (serviceid && serviceid != this.#id) {
          const service = this.#serviceManager.getService(serviceid)
          if (service) {
            if (!service.isStarted) {
              this.#logWrite(
                "info",
                `dependant service ${serviceid} not started, service status is ${this.#statusname(
                  service.#status
                )}.`
              )
            }
          }
        }
      }

      // for this service its dependencies are ready
      if (!depend_on_services_started) {
        this.#log(
          `dependant services not started, service status is ${this.#statusname(
            this.#status
          )}.`
        )
        this.#setStatus(ServiceStatus.DEPENDENCIESNOTREADY)
        return
      }

      this.#setStatus(ServiceStatus.DEPENDENCIESREADY)
      this.#log(`service dependencies are all ready.`)
    }
    // compile environment variables
    this.compileEnvironmentVariables(globalenv)

    this.#logWrite(
      "info",
      `environmentVariables: ${JSON.stringify(this.environmentVariables)}`
    )

    this.#log(
      `starting service ${this.#id} with env variables ${JSON.stringify(
        this.environmentVariables
      )}`
    )

    //check if commandconfig is set and execute it
    if (
      this.#options &&
      this.#options.execconfig &&
      this.#options.execconfig.commandconfig
    ) {
      //check if command is set
      const source = this.#options.execconfig.commandconfig.source
      const target = this.#options.execconfig.commandconfig.target

      if (source && target) {
        this.#log(`copying command config from ${source} to ${target}`)
        //copy command config to target
        this.#prepareConfigFile(source, target)
      }
    }

    this.#log(`do service setup, install: ${forceInstall}`)
    //run setup if it exists and force reinstall if needed
    await this.#doSetup(forceInstall)

    if (this.isRunnable) {
      this.#log(`starting ${this.#id}`)
      this.#setStatus(ServiceStatus.STARTING)

      //get executable name
      const serviceExecutable = this.getServiceExecutable()
      // get path to executable
      const serviceExecutablePath = this.getServiceExecutable(true)
      // get path where to spawn the executable
      const serviceExecutableCWD = this.#getServiceExecCWD(
        serviceExecutablePath
      )
      this.#log(`service executable ${serviceExecutable}`)
      this.#log(`service executable path ${serviceExecutablePath}`)
      this.#log(`service user data path ${this.#servicedatapath}`)
      this.#log(`service port ${this.#serviceport}`)

      if (serviceExecutable) {
        let commandlineArgs = new Array<string>()
        if (
          this.#options &&
          this.#options.execconfig &&
          this.#options.execconfig.commandline
        ) {
          // commandline = this.getServiceCommand().split(" ") || []
          commandlineArgs = this.getServiceCommandArguments(true, true) || []
        }

        this.#logWrite("INFO", [
          "commandlineArgs",
          JSON.stringify(commandlineArgs, null, 2),
        ])

        const options: SpawnOptions = {
          cwd: serviceExecutableCWD,
          signal: this.#abortController.signal,
          windowsVerbatimArguments: true,
          env: this.environmentVariables,

          shell: this.#execshell || false,

          // send data to logs but it will be delayed as its buffered in 64k blocks :(
          // stdio: ["ignore", this.#stdout, this.#stderr],
          // stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true,
          // detached: !this.isWindows, // only set this on linux and mac
        }

        //run the service process
        try {
          const execCommand = this.#getExecCommandRelativeToCWD(
            serviceExecutable,
            options.cwd + ""
          )

          this.#log(
            `starting service ${serviceExecutable}, commandline: ${execCommand}, args: ${JSON.stringify(
              commandlineArgs
            )}, cwd: ${options.cwd}`
          )

          console.log("")
          console.log(`execCommand: ${execCommand}`)
          console.log(
            `commandlineArgs: ${JSON.stringify(commandlineArgs, null, 2)}`
          )
          console.log(`options: ${JSON.stringify(options, null, 2)}`)
          console.log("")
          console.log("----")
          const process = child_process.spawn(
            execCommand,
            commandlineArgs,
            options
          )

          // monitor console
          if (process.stdout) {
            // process.stdout.setEncoding("utf8")
            process.stdout.on("data", (data) => {
              this.#logWrite("XXXXXXXX", data)
              this.#handleProcessOutput(data)
            })
            process.stdout.on("end", (data) => {
              this.#logWrite("info", `output log closed ${data}`)
            })
          }
          // monitor error log
          if (process.stderr) {
            // process.stderr.setEncoding("utf8")
            process.stderr.on("data", (data) => {
              this.#logWrite("error", data)
              this.#errorWrite("error", data)
            })
            process.stderr.on("end", (data) => {
              this.#logWrite("info", `error log closed ${data}`)
            })
          }
          // const process = child_process.spawn(
          //   execCommand,
          //   commandlineArgs,
          //   options
          // )
          console.log("^^^^")
          console.log("")
          console.log("")
          console.log("")

          this.#log([
            "spawn",
            process.pid,
            JSON.stringify({
              spawnfile: process.spawnfile,
              spawnargs: process.spawnargs,
              signalCode: process.signalCode,
              execCommand: execCommand,
              commandline: commandlineArgs,
              cwd: options.cwd,
              env: this.environmentVariables,
            }),
          ])

          this.#logWrite(
            "INFO",
            JSON.stringify(
              {
                serviceExecutable: execCommand,
                commandline: commandlineArgs,
                options: options,
                env: this.environmentVariables,
              },
              null,
              2
            )
          )

          this.#register(process)

          // if service is utility, wait for it to exit
          if (this.isUtility) {
            this.#log(`service ${this.id} is utility, waiting for exit.`)
            await this.#waitForProcessExitAsync(process)
            this.#log(`service ${this.id} exited.`)
          }
          // this.#log(`service ${this.id} started and registered.`)
        } catch (error) {
          this.#setStatus(ServiceStatus.ERROR)
          this.#log(`error starting service ${this.id} with error ${error}`)
        }
      } else {
        this.#log("unsuported service type, serviceExecutable is not set.")
        return
      }
    } else {
      this.#log("service is not runnable, done.")
      // if servicetype is utility, set status to completed
      if (this.isUtility) {
        this.#setStatus(ServiceStatus.COMPLETED)
      } else {
        this.#setStatus(ServiceStatus.AVAILABLE)
      }
      return
    }
  }

  #waitForProcessExitAsync(process: ChildProcess) {
    return new Promise<void>((resolve, reject) => {
      process.on("exit", (code, signal) => {
        this.#log(
          `service ${this.id} exited with code ${code} and signal ${signal}`
        )
        resolve()
      })
    })
  }

  //cretae pid file for service
  #createServicePidFile(servicepidfile: string, pid: number) {
    if (this.#process && pid && servicepidfile) {
      fs.writeFileSync(servicepidfile, pid.toString())
    } else {
      this.#log("child process is null")
    }
  }

  // remiove service pid file
  #removeServicePidFile() {
    if (fs.existsSync(this.#servicepidfile)) {
      fs.unlinkSync(this.#servicepidfile)
    }
  }

  async stop() {
    if (this.#process) {
      const pid: number = this.#process?.pid ? this.#process.pid : 0
      if (pid > 0) {
        this.#stopHealthCheck()
        this.#log(`stopping ${this.#id} with pid ${pid}`)
        let stopCommand = this.getActionForPlatform(ServiceActionsEnum.STOP)
        // if stop command is defined run the commandline as a process
        if (stopCommand) {
          this.#setStatus(ServiceStatus.STOPCOMMANDSTART)
          if (stopCommand.startsWith(COMMAND_LINE_DIRECTCOMMAND_PREFIX)) {
            stopCommand = stopCommand.substring(1)

            const execPath = this.getServiceExecutable(true)
            const stopCommandLine = this.getCommandLineArguments(
              stopCommand,
              execPath
            )
            await os
              .runProcess(stopCommandLine.exe, stopCommandLine.args, {
                signal: this.#abortController.signal,
                cwd: stopCommandLine.cwd,
                stdio: ["ignore", this.#stdout, this.#stderr],
                env: this.environmentVariables,
                windowsHide: true,
              })
              .then((result) => {
                this.#log(`shell command ${stopCommand} result ${result}`)
                // this.#removeServicePidFile()
                this.#setStatus(ServiceStatus.STOPPED)
              })
              .catch((err) => {
                this.#log(`shell command ${stopCommand} error ${err}`)
                if (os.isPathExist(this.#servicepidfile)) {
                  this.#setStatus(ServiceStatus.ERROR)
                } else {
                  this.#setStatus(ServiceStatus.STOPPED)
                }
              })
              .finally(() => {
                this.#removeServicePidFile()
              })
            return
          }

          let serviceExecutable = this.getServiceExecutable()

          // check if executing service with another service
          if (this.#options.execconfig.execservice) {
            // find service executable
            const execservice: ExecService =
              this.#options.execconfig.execservice

            //check if using cli command for the service
            if (execservice.id && execservice.cli) {
              const serviceExecutableService = this.#serviceManager.getService(
                execservice.id
              )
              const serviceExecutableRoot =
                serviceExecutableService.getServiceExecutableRoot()
              serviceExecutable =
                serviceExecutable + COMMAND_LINE_ARGUMENT_SEPARATOR + '"'
              serviceExecutableService.getServiceCommandCli() + '"'
              this.#execservicepath = serviceExecutableRoot
              this.#log(
                `executing stop command using command cli ${serviceExecutable}`
              )
            }
          }

          // join service executable with stop command
          stopCommand = `${serviceExecutable} ${stopCommand}`

          const stopCommandLine = this.getCommandLineArguments(
            stopCommand,
            this.#servicepath
          )

          stopCommand = `${stopCommandLine.exe} ${stopCommandLine.args.join(
            COMMAND_LINE_ARGUMENT_SEPARATOR
          )}`

          this.#log(
            `stopping ${this.#id} with pid ${pid} in ${
              this.#servicepath
            } using stop command: ${stopCommand}`
          )

          await os
            .runProcess(stopCommandLine.exe, stopCommandLine.args, {
              signal: this.#abortController.signal,
              cwd: stopCommandLine.cwd,
              stdio: ["ignore", this.#stdout, this.#stderr],
              env: this.environmentVariables,
              windowsHide: true,
            })
            .then((result) => {
              this.#log(`stop command ${stopCommand} result ${result}`)
              this.#setStatus(ServiceStatus.STOPCOMMANDSTART)
              // create setup file to mark that setup already happened
              // fs.writeFileSync(this.#setupstatefile, "setup completed")
            })
            .catch((err) => {
              this.#log(`stop command ${stopCommand} error ${err}`)
              this.#setStatus(ServiceStatus.ERROR)
            })
            .finally(() => {
              // this.#log(`setup command ${setupCommand} complete`)
              this.#setStatus(ServiceStatus.STOPPED)
            })
          return
        }
        this.#setStatus(ServiceStatus.STOPPING)
        if (!this.#process.kill(SignalType.SIGINT)) {
          this.#log(`killing ${this.#id} with pid ${pid}`)
          kill(pid, SignalType.SIGINT, (err) => {
            this.#log(`killed ${this.#id} with pid ${pid} error ${err}`)
            this.#removeServicePidFile()
          })
        } else {
          this.#log(`gracefully closed ${this.#id} with pid ${pid}`)
          this.#removeServicePidFile()
        }
      }
    }
  }

  // write to service error log
  #errorWrite(type: string, message: any) {
    if (this.#stderr) {
      const timestamp = this.#timestamp
      this.#stderr.write(`${timestamp} ${type.toUpperCase()} ${message}\n`)
    }
  }

  // write to service log
  #logWrite(type: string, message: any) {
    if (this.#stdout) {
      const timestamp = this.#timestamp
      this.#stdout.write(`${timestamp} ${type.toUpperCase()} ${message}\n`)
    }
  }

  #log(message: any) {
    this.#logger.log(message)
    this.emit("log", this.#id, message)
    if (this.#debuglog) {
      this.#logWrite("info", message)
    }
  }

  #warn(message: any) {
    this.#logger.warn(message)
    this.emit("log", this.#id, message)
    if (this.#debuglog) {
      this.#logWrite("warn", message)
    }
  }

  #debug(message: any) {
    this.#logger.debug(message)
    this.emit("log", this.#id, message)
    if (this.#debuglog) {
      this.#logWrite("debug", message)
    }
  }

  #setStatus(newstatus: ServiceStatus) {
    this.#status = newstatus
    if (this.#events.sendServiceStatus) {
      this.#events.sendServiceStatus(this.#id, newstatus)
      this.emit("status", this.#id, newstatus)
    }
  }

  get isRunnable() {
    return this.getServiceCommand().trim().length > 0 ? true : false
  }

  get isInstallable() {
    if (
      this.#options.execconfig.setup ||
      this.#options.execconfig.setuparchive
    ) {
      return true
    }
    return false
  }

  get isSetup() {
    if (this.#options.execconfig.setup) {
      this.#debug(`setup: ${JSON.stringify(this.#options.execconfig.setup)}`)
    }
    if (this.#options.execconfig.setuparchive) {
      this.#debug(
        `setuparchive: ${JSON.stringify(this.#options.execconfig.setuparchive)}`
      )
    }
    this.#debug(`setupstatefile: ${this.#setupstatefile}`)
    this.#debug(`setuparchiveOutputPath: ${this.#setuparchiveOutputPath}`)
    let isSetup = false
    if (this.#setupstatefile) {
      isSetup = os.isPathExist(this.#setupstatefile)
      this.#debug(`setupstatefile exist: ${isSetup}`)
      return isSetup
    }

    if (
      !this.#options.execconfig.setup &&
      !this.#options.execconfig.setuparchive
    ) {
      this.#debug(`not setup or setuparchive set, returning true.`)
      return true
    } else {
      if (this.#options.execconfig.setuparchive) {
        if (!this.#doValidateSetup()) {
          this.#debug(
            `isSetup archive setuparchiveOutputPath: ${
              this.#setuparchiveOutputPath
            } = ${os.isPathExist(this.#setuparchiveOutputPath)}`
          )
        }
        return os.isPathExist(this.#setuparchiveOutputPath)
      }
      if (this.#options.execconfig.setup) {
        return isSetup
      }
    }
    this.#log(`can't determine if service is setup`)
    return false
  }
  // run setup scripts
  #doValidateSetup() {
    // check if executables are present then create setup state file
    if (!os.isPathExist(this.#setupstatefile)) {
      const executable = this.getExecutaleForPlatform
      if (executable) {
        const executablePath = path.join(this.#servicepath, executable)
        if (os.isPathExist(executablePath)) {
          this.#debug(`executable ${executablePath} is found`)
          fs.writeFileSync(this.#setupstatefile, "setup found")
        } else {
          this.#debug(`executable ${executablePath} is not found`)
          return false
        }
      }
    }
    return true
  }

  // extract service archive
  async #doExtract(archive: string, destination: string) {
    try {
      this.#ensurePath(destination)
      if (archive.endsWith(".zip")) {
        this.#log(`unpackZip(${archive}, ${destination})`)
        await unpackZip(archive, destination)
      } else if (archive.endsWith(".tar.gz")) {
        this.#log(`unpackTarGz(${archive}, ${destination})`)
        await unpackTarGz(archive, destination)
      } else {
        this.#log(`unpack7Zip(${archive}, ${destination})`)
        // await Seven.extract(archive, destination)
        await this.unpack7Zip(archive, destination)
      }
    } catch (err) {
      this.#log(`unable to extracted setup archive ${err}`)
    }
  }

  async unpack7Zip(archive, destination) {
    return new Promise<void>((resolve, reject) => {
      const archiveService = this.#serviceManager.getService("archive")
      if (archiveService) {
        const serviceExec = archiveService.getServiceExecutable()
        const commandArgs = ["x", "-aoa", archive]

        os.runProcess(
          this.#getExecCommandRelativeToCWD(serviceExec, destination),
          commandArgs,
          {
            signal: this.#abortController.signal,
            cwd: destination,
            stdio: ["ignore", this.#stdout, this.#stderr],
            env: this.environmentVariables,
            windowsHide: true,
          }
        )
          .then((result) => {
            this.#log(`shell command ${serviceExec} result ${result}`)
            resolve()
          })
          .catch((err) => {
            this.#log(`shell command ${serviceExec} error ${err}`)
            this.#setStatus(ServiceStatus.ERROR)
            reject()
          })
      }
    })
  }

  async install() {
    this.#log(`installing service ${this.#id}`)
    //run install routine
    await this.#doSetup(true)
    this.#log(`installed service ${this.#id}`)
  }

  // run setup scripts
  async #doSetup(force = false) {
    const isSetupStateFile = os.isPathExist(this.#setupstatefile)
    // extract setuparchive before setup
    if (this.#setuparchiveFile) {
      if (!os.isPathExist(this.#setuparchiveOutputPath) || force) {
        this.#setStatus(ServiceStatus.EXTRACTING)
        this.#log(
          `extracting setup archive ${this.#setuparchiveFile} into ${
            this.#servicepath
          }.`
        )
        this.#logWrite(
          "info",
          `extracting setup archive ${this.#setuparchiveFile} into ${
            this.#servicepath
          }.`
        )
        await this.#doExtract(
          this.#setuparchiveFile,
          this.#setuparchiveOutputPath
        ).finally(() => {
          this.#log(
            `extracted setup archive ${this.#setuparchiveFile} in ${
              this.#servicepath
            }.`
          )

          // as we have just extracted the archive, we need to force the setup
          force = true
          fs.writeFileSync(this.#setupstatefile, "archive extracted")
        })
        this.#setStatus(ServiceStatus.EXTRACTED)
      } else {
        this.#log(
          `setup archive already extracted in ${this.#setuparchiveOutputPath}`
        )
      }
    }
    // run setup steps
    if (this.#setup && this.#setup.length > 0) {
      if (!isSetupStateFile || force) {
        this.#log(
          `service ${
            this.#id
          } has not been been configured, executing setup commands.`
        )
        this.#setStatus(ServiceStatus.INSTALLING)

        let serviceExecutable = this.getServiceExecutable()
        this.#execservicepath = this.getServiceExecutableRoot()

        // check if executing service with another service
        if (this.#options.execconfig.execservice) {
          // find service executable
          const execservice: ExecService = this.#options.execconfig.execservice
          if (execservice.id) {
            const serviceExecutableService = this.#serviceManager.getService(
              execservice.id
            )
            if (!serviceExecutableService.isSetup) {
              this.#log(
                `parent services ${serviceExecutableService.id} needs to be configured.`
              )
              await serviceExecutableService.#doSetup()
              this.#log(
                `parent services ${serviceExecutableService.id} has been configured.`
              )
            }
          }
          //check if using cli command for the service
          if (execservice.id && execservice.cli) {
            const serviceExecutableService = this.#serviceManager.getService(
              execservice.id
            )
            const serviceExecutableRoot =
              serviceExecutableService.getServiceExecutableRoot()
            const serviceExecutableCli =
              serviceExecutableService.getServiceCommandCli()

            serviceExecutable = `${serviceExecutable} ${serviceExecutableCli}`

            this.#execservicepath = serviceExecutableRoot
            this.#log(`executing using command cli ${serviceExecutable}`)
          }
        }

        // list of setup processess running in backgroud to kill after setup
        const backgroundProcesses: Promise<any>[] = []
        const execPath = this.#getServiceExecCWD(serviceExecutable)

        //for each setup command in #setup, execute it
        for (let i = 0; i < this.#setup.length; i++) {
          //get step command
          const setupCommand = this.#setup[i].trim()

          // if setup command is empty or starts with #, skip it
          if (
            !setupCommand ||
            setupCommand.startsWith(COMMAND_LINE_COMMENT_PREFIX)
          ) {
            this.#log(`skipping setup step ${setupCommand}`)
            continue
          }

          // if setup command starts with ;, execute it as shell command
          if (setupCommand.startsWith(COMMAND_LINE_DIRECTCOMMAND_PREFIX)) {
            let shellCommand = setupCommand.substring(1).trim()

            // does shell command ends with & then run it in background
            if (shellCommand.endsWith(COMMAND_LINE_BACKGROUND_PROCESS_SUFFIX)) {
              // remove & from shell command
              shellCommand = shellCommand
                .substring(0, shellCommand.length - 1)
                .trim()

              const shellCommandLine = this.getCommandLineArguments(
                shellCommand,
                execPath
              )

              this.#log(
                `in path ${execPath} run command ${JSON.stringify(
                  shellCommandLine
                )}`
              )
              this.#logWrite(
                "info",
                `in path ${execPath} run command ${JSON.stringify(
                  shellCommandLine
                )}`
              )

              // run shell command in background and add it to backgroundProcesses
              const backgroundProcess = os
                .runProcess(shellCommandLine.exe, shellCommandLine.args, {
                  signal: this.#abortController.signal,
                  cwd: shellCommandLine.cwd,
                  stdio: ["ignore", this.#stdout, this.#stderr],
                  env: this.environmentVariables,
                  windowsHide: true,
                })
                .then((result) => {
                  this.#log(`shell command ${shellCommand} result ${result}`)
                })
                .catch((err) => {
                  this.#log(`shell command ${shellCommand} error ${err}`)
                  this.#setStatus(ServiceStatus.ERROR)
                })
              backgroundProcesses.push(backgroundProcess)
              continue
            }

            const shellCommandLine = this.getCommandLineArguments(
              setupCommand,
              this.#servicepath
            )

            shellCommand =
              shellCommandLine.exe + " " + shellCommandLine.args.join(" ")

            this.#log(
              `executing setup shell command: ${shellCommand} in ${
                this.#servicepath
              } with env ${JSON.stringify(this.environmentVariables, null, 2)}.`
            )
            this.#logWrite(
              "info",
              `executing shell command: ${shellCommand} in ${this.#servicepath}`
            )
            this.#errorWrite(
              "XXX2",
              `execCommand: ${
                shellCommandLine.exe
              } ${shellCommandLine.args.join(" ")}`
            )
            await os
              .runProcess(shellCommandLine.exe, shellCommandLine.args, {
                signal: this.#abortController.signal,
                cwd: shellCommandLine.cwd,
                stdio: ["ignore", this.#stdout, this.#stderr],
                env: this.environmentVariables,
                windowsHide: true,
              })
              .then((result) => {
                this.#log(`shell command ${shellCommand} result ${result}`)
              })
              .catch((err) => {
                this.#log(`shell command ${shellCommand} error ${err}`)
                this.#errorWrite(
                  "info",
                  `error with setup command ${shellCommand} error ${err}`
                )
                this.#setStatus(ServiceStatus.ERROR)
              })
            continue
          }

          const execCommand = `${serviceExecutable} ${setupCommand}`
          this.#log(`preparing execCommand: ${execCommand}`)
          this.#log(`preparing execCommand for path: ${execPath}`)

          const execCommandLine = this.getCommandLineArguments(
            execCommand,
            execPath
          )

          // execute setup command using service executable
          this.#log(
            `execCommand: ${execCommandLine.exe} ${execCommandLine.args.join(" ")}`
          )
          this.#log(`execCommand path: ${execCommandLine.cwd}`)
          this.#debug(
            `environmentVariables: ${JSON.stringify(this.environmentVariables)}`
          )
          this.#debug(
            `PATH: ${JSON.stringify(this.environmentVariables["PATH"])}`
          )
          this.#debug(
            `PYTHONUSERBASE: ${JSON.stringify(
              this.environmentVariables["PYTHONUSERBASE"]
            )}`
          )
          this.#errorWrite(
            "XXX1",
            `execCommand: ${execCommandLine.exe} ${execCommandLine.args.join(" ")} in ${execCommandLine.cwd}`
          )
          await os
            .runProcess(execCommandLine.exe, execCommandLine.args, {
              signal: this.#abortController.signal,
              cwd: execCommandLine.cwd,
              stdio: ["ignore", this.#stdout, this.#stderr],
              env: this.environmentVariables,
              windowsHide: true,
            })
            .then((result) => {
              this.#log(`setup command ${execCommandLine.exe} result ${result}`)
              this.#setStatus(ServiceStatus.INSTALLED)
              // create setup file to mark that setup already happened
              // fs.writeFileSync(this.#setupstatefile, "setup completed")
            })
            .catch((err) => {
              this.#log(`setup command ${execCommandLine.exe} error ${err}`)
              this.#errorWrite(
                "info",
                `error with setup command ${execCommandLine.exe} error ${err}`
              )
              this.#setStatus(ServiceStatus.ERROR)
            })
            .finally(() => {
              this.#log(`setup command ${execCommandLine.exe} complete`)
            })
        }
        // terminate all processes running in backgroundProcess
        await Promise.all(backgroundProcesses)
          .then(() => {
            this.#log(`all background processes terminated`)
          })
          .catch((err) => {
            this.#log(`error terminating background processes ${err}`)
          })
        fs.writeFileSync(this.#setupstatefile, "setup completed")
        this.#setStatus(ServiceStatus.INSTALLED)
      } else {
        this.#log(`service ${this.#id} is already and has been configured.`)
        this.#setStatus(ServiceStatus.AVAILABLE)
      }
    }
  }

  #checkRunning() {
    // check if service is already running
    if (os.isPathExist(this.#servicepidfile)) {
      const pid = fs.readFileSync(this.#servicepidfile, "utf8")

      //check if service pid is runnin on linux
      if (this.isWindows) {
        os.runCommandWithCallBack(
          'tasklist /fi "PID eq ' + pid + '"',
          [],
          { signal: this.#abortController.signal },
          (data) => {
            if (data.includes("No tasks are running")) {
              // no process running
              this.#removeServicePidFile()
              this.#setStatus(ServiceStatus.STOPPED)
            } else {
              // process is running
              this.#setStatus(ServiceStatus.STARTED)
              return
            }
          }
        )
      } else {
        os.runCommandWithCallBack(
          "ps -p " + pid + " -o pid= || echo 'No such process'",
          [],
          { signal: this.#abortController.signal },
          (data) => {
            if (data.includes("No such process")) {
              // no process running
              this.#removeServicePidFile()
              this.#setStatus(ServiceStatus.STOPPED)
            } else {
              // process is running
              this.#setStatus(ServiceStatus.STARTED)
              return
            }
          }
        )
      }
    } else {
      if (this.isEnabled) {
        this.#setStatus(ServiceStatus.AVAILABLE)
      } else {
        this.#setStatus(ServiceStatus.DISABLED)
      }
    }
  }

  // wait untill all depend_on services are started
  async #waitForDependOnServices(
    globalenv: { [key: string]: string } = {}
  ): Promise<boolean> {
    if (
      this.#options.execconfig.depend_on &&
      this.#options.execconfig.depend_on.length > 0
    ) {
      const dependOnServices = this.#options.execconfig.depend_on
      this.#log(`waiting for depend_on services ${dependOnServices}`)
      for (let i = 0; i < dependOnServices.length; i++) {
        const depend_on_service = dependOnServices[i]
        const service = this.#serviceManager.getService(depend_on_service)
        if (service) {
          this.#log(
            `checking services ${service.id} status ${service.status} and setup ${service.isSetup}.`
          )

          // Make sure all system services are configured.
          if (service.isAvailable && service.isSetup) {
            this.#log(`service ${service.id} is ready.`)
            if (service.isUtility) {
              continue
            }
          }

          if ((service.isRunnable && !service.isRunning) || service.isUtility) {
            this.#log(`starting service ${service.id}.`)
            await service.start(globalenv)

            if (service.isRunning) {
              continue
            } else {
              this.#log(`service ${service.id} did not start.`)
              return false
            }
          }
        }
      }
    }

    return true
  }

  // wait untill all depend_on services are started
  async #waitForDependOnServicesAsync(
    globalenv: { [key: string]: string } = {},
    startchain: string[] = []
  ) {
    return new Promise((resolve) => {
      if (
        this.#options.execconfig.depend_on &&
        this.#options.execconfig.depend_on.length > 0
      ) {
        const dependOnServices = this.#options.execconfig.depend_on
        // if execservice is set add it to the startchain
        if (
          this.#options.execconfig.execservice &&
          this.#options.execconfig.execservice.id
        ) {
          this.#log(
            `this service is executed by parent ${
              this.#options.execconfig.execservice.id
            } adding to dependency list chain.`
          )
          dependOnServices.push(this.#options.execconfig.execservice.id)
        }

        this.#log(`waiting for depend_on services async ${dependOnServices}.`)
        const interval = setInterval(async () => {
          let depend_on_services_started = true
          let depend_on_services_isstarting = false
          for (let i = 0; i < dependOnServices.length; i++) {
            const depend_on_service = dependOnServices[i]
            const service = this.#serviceManager.getService(depend_on_service)
            //skip if service is already in start chain
            if (startchain.includes(depend_on_service)) {
              if (service.isStarting || service.isInstalling) {
                //if service is starting, wait for it to start to continue along chain
                this.#log(
                  `service ${depend_on_service} is starting current status ${service.#statusname(
                    service.#status
                  )}.`
                )
                // depend_on_services_started = false
                // break
                depend_on_services_isstarting = true
                continue // check other services in chain
              }
              continue // check other services in chain
            }
            if (service) {
              this.#log(
                `checking services ${service.id} status ${service.#statusname(
                  service.#status
                )} and setup ${service.isSetup}.`
              )

              //add this service to start chain, to avoid circular dependency
              startchain.push(depend_on_service)

              // Make sure all system services are configured.
              if (
                (service.status == ServiceStatus.AVAILABLE ||
                  service.status == ServiceStatus.INSTALLED) &&
                service.isSetup
              ) {
                this.#log(`service ${service.id} is available and ready.`)
              }

              const tryToStart =
                service.isRunnable == true &&
                !service.isRunning &&
                !service.isDone

              if (tryToStart == true) {
                this.#log(`starting service ${service.id} and wait.`)
                //add this service to start chain
                await service.start(this.#serviceManager.globalEnv, startchain)

                const aservice =
                  this.#serviceManager.getService(depend_on_service)

                this.#log(
                  `started service ${
                    aservice.id
                  } result status ${service.#statusname(aservice.#status)}.`
                )

                // Make sure all system services are configured.
                if (service.isAvailable && service.isSetup) {
                  this.#log(
                    `service ${service.id} is ready during healthcheck.`
                  )
                  if (service.isUtility) {
                    continue //next service
                  }
                }

                //Make sure all the services are started.
                if (!service.isRunning) {
                  this.#log(
                    `service ${service.id} did not start during healthcheck.`
                  )
                  depend_on_services_started = false
                  //service did not start, abort
                  break //break dependOnServices loop
                } else {
                  //stop health check for this if it still running
                  // service.#stopHealthCheck()
                  this.#log(`service ${service.id} is running.`)
                  //next service
                }
              } else {
                if (service.isUtility && !service.isSetup) {
                  this.#log(
                    `service ${service.id} is a utility and needs to be setup.`
                  )
                  await service.start(
                    this.#serviceManager.globalEnv,
                    startchain
                  )
                }
                //this service is not runnable or already running, continue
                continue //next service
              }
            }
          }
          if (
            depend_on_services_started &&
            depend_on_services_isstarting == false
          ) {
            this.#log(`all dependent services started.`)
            clearInterval(interval)
            resolve(depend_on_services_started)
          }
        }, 1000)
      } else {
        resolve(true)
      }
    })
  }

  /**
   *
   * @param template template string
   * @param args arguments to be replaced in template
   * @returns interpolated string
   */
  #updateTemplateVars(
    template: string,
    args: { [key: string]: string }
  ): string {
    if (typeof args !== "object") {
      return template
    }
    try {
      return new Function(
        "return `" + template.replace(/\$\{(.+?)\}/g, "${this.$1}") + "`;"
      ).call(args)
    } catch (e) {
      // ES6 syntax not supported
    }
    Object.keys(args).forEach((key) => {
      template = template.replace(
        new RegExp("\\$\\{" + key + "\\}", "g"),
        args[key]
      )
    })
    return template
  }

  /**
   * get string timestamp
   * @returns timestamp
   */
  get #timestamp(): string {
    return new Date().toISOString()
  }
}
