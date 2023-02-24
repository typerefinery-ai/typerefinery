import * as path from "path"
import { ChildProcess, spawn, type SpawnOptions } from "child_process"
import { type ServiceManager } from "./ServiceManager"
import { Logger } from "./Logger"
import fs, { createWriteStream, WriteStream } from "fs"
import http, { type RequestOptions } from "node:http"
import net from "net"
import EventEmitter from "eventemitter3"
import kill from "tree-kill"
import { os } from "./Utils"
import { unpackZip, unpackTarGz } from "@particle/unpack-file"

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
  readonly status: (id: string, output: any) => void
  readonly log: (id: string, output: any) => void
}

export enum SignalType {
  SIGTERM = "SIGTERM",
  SIGKILL = "SIGKILL",
  SIGINT = "SIGINT",
}

export enum ServiceStatus {
  INVALIDCONFIG = "-10",
  ERROR = "-1",
  DISABLED = "0",
  LOADED = "1",
  ARCHIVED = "5",
  AVAILABLE = "10",
  INSTALLING = "15",
  INSTALLED = "20",
  STOPPING = "30",
  STOPPED = "60",
  STARTING = "90",
  STARTED = "120",
}

export enum ServiceType {
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

export interface ExecConfig {
  authentication?: Authentication
  execservice?: ExecService
  executable?: {
    win32?: string
    darwin?: string
    linux?: string
    default?: string
  }
  executablecli?: {
    win32?: string
    darwin?: string
    linux?: string
    default?: string
  }
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
  commandline?: {
    win32?: string
    darwin?: string
    linux?: string
    default?: string
  }
  commandlinecli?: {
    win32?: string
    darwin?: string
    linux?: string
    default?: string
  }
  datapath?: string
  serviceorder?: 99
  depend_on?: string[]
  serviceport?: number
  servicehost?: string
  healthcheck?: HealthCheck
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

export interface SericeConfigFile {
  id: string
  name?: string
  description?: string
  enabled?: boolean
  status?: ServiceStatus
  logoutput?: string
  icon?: string
  servicetype?: ServiceType
  execconfig: ExecConfig
}

export class Service extends EventEmitter<ServiceEvent> {
  #process?: ChildProcess
  #id: string
  #name: string
  #description: string
  #servicehome: string
  #servicepath: string
  #execservicepath = ""
  #servicedatapath: string
  #servicepidfile: string
  #servicesroot: string
  #options: SericeConfigFile
  #events: ServiceEvents
  #serviceport?: number
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
    this.#serviceport = this.#options.execconfig?.serviceport || 0
    this.#servicehost = this.#options.execconfig?.servicehost || "localhost"
    this.#healthCheck = this.#options.execconfig?.healthcheck
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
    this.#stderr = createWriteStream(this.#stderrLogFile, {
      flags: "a",
      mode: 0o666,
      autoClose: true,
      encoding: "utf8",
      highWaterMark: 100,
    })
    this.#stderr.on("error", (err) => {
      this.#logger.error(err)
    })
    this.#log(`service error log ${this.#stderr.path}`)

    // create stdout log file for service executable
    this.#stdoutLogFile = path.join(logsDir, `${this.#id}-console.log`)
    this.#ensurePathToFile(this.#stdoutLogFile)
    this.#stdout = createWriteStream(this.#stdoutLogFile, {
      flags: "a",
      mode: 0o666,
      autoClose: true,
      encoding: "utf8",
      highWaterMark: 100,
    })
    this.#stdout.on("error", (err) => {
      this.#logger.error(err)
    })
    this.#log(`service console log ${this.#stdout.path}`)

    const config = options.execconfig
    if (config) {
      this.#serviceport = config.serviceport || -1
    }

    this.#servicesroot = path.resolve(path.dirname(servicepath))

    // set service setup check
    this.#setupstatefile = path.join(
      this.#servicedatapath,
      path.basename(this.#servicehome) + ".setup"
    )
    this.#ensurePathToFile(this.#setupstatefile)

    // set service pid and check if its not running
    this.#servicepidfile = path.join(
      this.#servicedatapath,
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
          setupArchive.output
        )
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

    this.#log(`service ${this.#id} loaded with status ${this.#status}.`)
    this.#checkRunning()
  }

  get name(): string {
    return this.#name
  }

  get description(): string {
    return this.#description
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
    return command
      .replaceAll("${SERVICE_HOME}", service.#servicehome)
      .replaceAll("${SERVICE_EXECUTABLE}", service.getServiceExecutable())
      .replaceAll(
        "${SERVICE_EXECUTABLE_CLI}",
        service.getServiceExecutableCli()
      )
      .replaceAll("${SERVICE_PATH}", service.#servicepath)
      .replaceAll("${EXEC_SERVICE_PATH}", service.#execservicepath)
      .replaceAll("${SERVICE_DATA_PATH}", service.#servicedatapath)
      .replaceAll("${SERVICE_PORT}", service.#serviceport + "")
      .replaceAll("${SERVICE_HOST}", service.#servicehost + "")
      .replaceAll("${SERVICE_LOG_PATH}", service.#logsDir + "")
      .replaceAll("${SERVICE_AUTH_USERNAME}", service.username)
      .replaceAll("${SERVICE_AUTH_PASSWORD}", service.password)
  }

  get environmentVariables() {
    const envVar = {}
    // add default env vars
    envVar["SERVICE_HOME"] = this.#servicehome
    envVar["SERVICE_EXECUTABLE"] = this.getServiceExecutable()
    envVar["SERVICE_EXECUTABLE_CLI"] = this.getServiceExecutableCli()
    envVar["SERVICE_PATH"] = this.#servicepath
    envVar["EXEC_SERVICE_PATH"] = this.#execservicepath
    envVar["SERVICE_DATA_PATH"] = this.#servicedatapath
    envVar["SERVICE_PORT"] = this.#serviceport + ""
    envVar["SERVICE_HOST"] = this.#servicehost + ""
    envVar["SERVICE_LOG_PATH"] = this.#logsDir + ""
    envVar["SERVICE_AUTH_USERNAME"] = this.username
    envVar["SERVICE_AUTH_PASSWORD"] = this.password

    // for each attribute in envVar update is value
    const serviceEnvVar = this.#options.execconfig?.env || {}
    for (const key in serviceEnvVar) {
      if (serviceEnvVar[key]) {
        const value = serviceEnvVar[key]
        envVar[key] = this.#getServiceCommand(value, this)
      }
    }

    return envVar
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

  get isStarted() {
    return this.#status === ServiceStatus.STARTED
  }

  get isRunning() {
    if (this.#process) {
      return !this.#process.killed
    } else {
      return false
    }
  }

  get port() {
    return this.#serviceport
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

  // register process and run health check
  #register(process: ChildProcess) {
    this.#process = process
    if (process.pid) {
      this.#createServicePidFile(this.#servicepidfile, process.pid)
    }
    process.once("exit", () => {
      this.#removeServicePidFile()
      this.#setStatus(ServiceStatus.STOPPED)
      this.#log(
        `process ${this.#id} with pid ${
          this.#process?.pid
        } exited, service status is ${this.#status}`
      )
      this.#process = void 0
    })
    // run health check if defined
    if (this.#healthCheck) {
      this.#startHealthCheck(this.#healthCheck.retries || 10)
    }
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
        `service is missing execconfig, service status is ${this.#status}`
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
          `service is missing execconfig, service status is ${this.#status}`
        )
      }
    }
    return serviceCommandCli
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
          `service is missing execconfig, service status is ${this.#status}`
        )
      }
    }
    return serviceCommand
  }

  // get service executable from options by platform
  getServiceExecutable(): string {
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
          // get full path to executable service
          const serviceExecutable = path.resolve(
            serviceExecutableService.#servicepath,
            serviceExecutableService.getServiceExecutable()
          )
          return serviceExecutable
        } else {
          this.#log("ExecService as been defined but no id was found")
        }
      } else if (this.#options.execconfig.executable) {
        // if service is being executed by a file
        serviceExecutable = this.#options.execconfig.executable[this.platform]
        if (serviceExecutable == null) {
          serviceExecutable = this.#options.execconfig.executable.default || ""
        }
        return serviceExecutable
      }
      if (serviceExecutable == null) {
        this.#log("could not determine service executable")
        // this.disable()
      }
    } else {
      this.#setStatus(ServiceStatus.INVALIDCONFIG)
      this.#log(
        `service is missing execconfig, service status is ${this.#status}`
      )
    }
    return serviceExecutable
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
          const serviceExecutable = path.resolve(
            serviceExecutableService.#servicepath,
            serviceExecutableService.getServiceExecutable()
          )
          return serviceExecutable
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
        return serviceExecutableCli
      }
      if (serviceExecutableCli == null) {
        this.#log("could not determine service executable")
        // this.disable()
      }
    } else {
      this.#setStatus(ServiceStatus.INVALIDCONFIG)
      this.#log(
        `service is missing execconfig, service status is ${this.#status}`
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

  // interval: 10s
  // retries: 60
  // start_period: 60s
  // start helth check and repeat until retries is 0
  #startHealthCheck(retries: number) {
    if (this.#healthCheck && this.#status != ServiceStatus.STARTED) {
      if (retries > 0) {
        const timeoutInterval = this.#healthCheck?.interval || 1000
        const nextRetry = retries - 1
        this.#runHealthCheck()
        setTimeout(
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
          } retries, service status is ${ServiceStatus[this.#status]}`
        )
      }
    }
  }

  // run health check
  #runHealthCheck(): void {
    if (this.#healthCheck) {
      if (this.#healthCheck.type == HealthCheckType.HTTP) {
        this.#runHealthCheckHttp()
      } else if (this.#healthCheck.type == HealthCheckType.TCP) {
        this.#runHealthCheckTcp()
      }
    }
  }

  // run health check http
  #runHealthCheckHttp(): void {
    if (this.#healthCheck && this.#healthCheck.url) {
      const urlFixed = this.#getServiceCommand(this.#healthCheck.url, this)
      const url: URL = new URL(urlFixed)
      const hostname = url.hostname
      const port = url.port
      const path = url.pathname
      const expected_status = this.#healthCheck.expected_status || 200

      const options: RequestOptions = {
        hostname: hostname,
        port: port,
        path: path,
        timeout: this.#healthCheck?.timeout || 1000,
      }

      this.#log(`http health check request ${hostname}; url ${url}`)

      try {
        const req = http.get(options, (res) => {
          if (res.statusCode == expected_status) {
            this.#setStatus(ServiceStatus.STARTED)
            this.#log(
              `http health check success, service status is ${this.#status}`
            )
          } else {
            this.#log(
              `http health check failed with status code ${
                res.statusCode
              }, service status is ${this.#status}`
            )
          }
        })
        req.on("error", (e) => {
          this.#log(
            `http health check request failed with error ${e}, service status is ${
              this.#status
            }`
          )
        })
      } catch (error) {
        this.#log(
          `http could not execute health check error is ${error}, service status is ${
            this.#status
          }`
        )
      }
    }
  }

  // run health check tcp
  #runHealthCheckTcp(): void {
    if (this.#healthCheck && this.#serviceport) {
      const hostname = this.#servicehost
      const port = this.#serviceport
      const socket = net.createConnection(port, hostname, () => {
        this.#setStatus(ServiceStatus.STARTED)
        this.#log(`tcp health check success, service status ${this.#status}`)
        socket.end()
      })
      socket.on("error", (error) => {
        this.#log(
          `tcp health check failed with error ${error}, service status ${
            this.#status
          }`
        )
      })
    }
  }

  // get an open port
  async #getOpenPort(): Promise<number> {
    const port = await this.#serviceManager.getOpenPort(
      this.#serviceport,
      this.#servicehost
    )
    return parseInt(port + "")
  }

  // start service and store its process id in a file based on os type
  async start() {
    //quick fail if disabled
    if (!this.isEnabled) {
      this.#log(`service ${this.#id} is disabled`)
      return
    }

    //quick fail already started
    if (this.isStarted) {
      this.#log(
        `service ${this.#id} already started with pid ${this.#process?.pid}`
      )
      return
    }

    this.#log(`waiting for dependent services`)
    // wait untill all depend_on services are started
    await this.#waitForDependOnServices()

    this.#log(`do service setup`)
    //run setup if it exists
    await this.#doSetup()

    //quick fail no command
    if (
      this.#options &&
      this.#options.execconfig &&
      !this.#options.execconfig.commandline
    ) {
      if (!(this.#setup && this.#setup.length > 0)) {
        this.#log(`can't start service ${this.#id} no command specified.`)
      }
      //silently backout as setup exists
      return
    }

    this.#log(`starting ${this.#id}`)
    this.#setStatus(ServiceStatus.STARTING)

    const serviceExecutable = this.getServiceExecutable()
    this.#log(`service executable ${serviceExecutable}`)
    this.#log(`service path ${this.#servicepath}`)
    this.#log(`service user data path ${this.#servicedatapath}`)

    this.#serviceport = await this.#getOpenPort()
    this.#log(`service port ${this.#serviceport}`)

    if (serviceExecutable) {
      let commandline = new Array<string>()
      if (
        this.#options &&
        this.#options.execconfig &&
        this.#options.execconfig.commandline
      ) {
        commandline = this.getServiceCommand().split(" ") || []
      }

      const options: SpawnOptions = {
        cwd: this.#servicepath,
        signal: this.#abortController.signal,
        windowsVerbatimArguments: true,
        env: this.environmentVariables,
        shell: false,
        // send data to logs but it will be delayed as its buffered in 64k blocks :(
        stdio: ["ignore", this.#stdout, this.#stderr],
        windowsHide: true,
      }

      const process = spawn(serviceExecutable, commandline, options)

      this.#log([
        "spawn",
        {
          serviceExecutable: serviceExecutable,
          commandline: commandline,
          options: options,
        },
        process.pid,
      ])

      // monitor console
      if (process.stdout) {
        process.stdout.setEncoding("utf8")
        process.stdout.on("data", (data) => {
          this.#log(data)
        })
      }
      // monitor error log
      if (process.stderr) {
        process.stderr.setEncoding("utf8")
        process.stderr.on("data", (data) => {
          this.#log(data)
        })
      }

      this.#register(process)
    } else {
      this.#log("unsuported service type")
      return
    }
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

  stop() {
    if (this.#process) {
      const pid: number = this.#process?.pid ? this.#process.pid : 0
      if (pid > 0) {
        this.#log(`stopping ${this.#id} with pid ${pid}`)
        this.#setStatus(ServiceStatus.STOPPING)
        if (!this.#process.kill(SignalType.SIGINT)) {
          this.#log(`killing ${this.#id} with pid ${pid}`)
          kill(pid, SignalType.SIGINT, (err) => {
            this.#log(`killed ${this.#id} with pid ${pid} error ${err}`)
          })
        } else {
          this.#log(`gracefully closed ${this.#id} with pid ${pid}`)
        }
      }
    }
  }

  #log(message: any) {
    this.#logger.log(message)
    this.emit("log", this.#id, message)
  }

  #warn(message: any) {
    this.#logger.warn(message)
    this.emit("log", this.#id, message)
  }

  #setStatus(newstatus: ServiceStatus) {
    this.#status = newstatus
    if (this.#events.sendServiceStatus) {
      this.#events.sendServiceStatus(this.#id, newstatus)
      this.emit("status", this.#id, newstatus)
    }
  }

  get isSetup() {
    if (
      !this.#options.execconfig.setup &&
      !this.#options.execconfig.setuparchive
    ) {
      return true
    } else if (this.#options.execconfig.setup) {
      this.#log(
        `isSetup setupstatefile: ${this.#setupstatefile} = ${os.isPathExist(
          this.#setupstatefile
        )}`
      )
      return os.isPathExist(this.#setupstatefile)
    } else if (this.#options.execconfig.setuparchive) {
      if (!this.#doValidateSetup()) {
        this.#log(
          `isSetup archive setuparchiveOutputPath: ${
            this.#setuparchiveOutputPath
          } = ${os.isPathExist(this.#setuparchiveOutputPath)}`
        )
      }
      return os.isPathExist(this.#setuparchiveOutputPath)
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
          this.#log(`executable ${executablePath} is found`)
          fs.writeFileSync(this.#setupstatefile, "setup found")
        } else {
          this.#log(`executable ${executablePath} is not found`)
          return false
        }
      }
    }
    return true
  }

  // extract service archive
  async #doExtract(archive: string, destination: string) {
    try {
      if (archive.endsWith(".zip")) {
        await unpackZip(archive, destination)
      } else if (archive.endsWith(".tar.gz")) {
        await unpackTarGz(archive, destination)
      }
    } catch (err) {
      this.#log(`unable to extracted setup archive ${err}`)
    }
  }

  // run setup scripts
  async #doSetup() {
    // extract setuparchive before setup
    if (this.#setuparchiveFile) {
      if (!os.isPathExist(this.#setuparchiveOutputPath)) {
        this.#log(`extracting setup archive ${this.#setuparchiveFile}`)
        await this.#doExtract(
          this.#setuparchiveFile,
          this.#servicepath
        ).finally(() => {
          this.#log(`extracted setup archive ${this.#setuparchiveFile}`)

          if (os.isPathExist(this.#setuparchiveOutputPath)) {
            fs.writeFileSync(this.#setupstatefile, "archive extracted")
          }
        })
      } else {
        this.#log(
          `setup archive already extracted in ${this.#setuparchiveOutputPath}`
        )
      }
    }
    // run setup steps
    if (this.#setup && this.#setup.length > 0) {
      if (!os.isPathExist(this.#setupstatefile)) {
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
            serviceExecutable =
              serviceExecutable +
              " " +
              serviceExecutableService.getServiceCommandCli()
            this.#execservicepath = serviceExecutableRoot
            this.#log(`executing using command cli ${serviceExecutable}`)
          }
        }

        // list of setup processess running in backgroud to kill after setup
        const backgroundProcesses: Promise<any>[] = []

        //for each setup command in #setup, execute it
        for (let i = 0; i < this.#setup.length; i++) {
          //get step command
          const step = this.#setup[i]
          //update vars in command
          const setupCommand = this.#getServiceCommand(step, this)
          // if setup command is empty or starts with #, skip it
          if (!setupCommand || setupCommand.startsWith("#")) {
            this.#log(`skipping setup step ${step}`)
            continue
          }
          // if setup command starts with ;, execute it as shell command
          if (setupCommand.startsWith(";")) {
            const shellCommand = setupCommand.substring(1)
            // does shell command ends with &?
            if (shellCommand.endsWith("&")) {
              this.#log(`run command in backgroud ${shellCommand}`)
              // run shell command in background and add it to backgroundProcesses
              const backgroundProcess = os
                .runProcess(shellCommand, [], {
                  signal: this.#abortController.signal,
                  cwd: this.#servicepath,
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
            this.#log(`executing setup shell command: ${shellCommand}`)
            console.log(shellCommand)
            await os
              .runProcess(shellCommand, [], {
                signal: this.#abortController.signal,
                cwd: this.#servicepath,
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
            continue
          }
          // execute setup command using service executable
          this.#log(`executing setup command: ${setupCommand}`)
          const execCommand = `${serviceExecutable} ${setupCommand}`
          this.#log(`execCommand: ${execCommand} in ${this.#servicepath}`)
          await os
            .runProcess(execCommand, [], {
              signal: this.#abortController.signal,
              cwd: this.#servicepath,
              stdio: ["ignore", this.#stdout, this.#stderr],
              env: this.environmentVariables,
              windowsHide: true,
            })
            .then((result) => {
              this.#log(`setup command ${setupCommand} result ${result}`)
              this.#setStatus(ServiceStatus.INSTALLED)
              // create setup file to mark that setup already happened
              // fs.writeFileSync(this.#setupstatefile, "setup completed")
            })
            .catch((err) => {
              this.#log(`setup command ${setupCommand} error ${err}`)
              this.#setStatus(ServiceStatus.ERROR)
            })
            .finally(() => {
              // this.#log(`setup command ${setupCommand} complete`)
            })
        }
        // terminate all processes running in backgroundProcess
        await Promise.all(backgroundProcesses).then(() => {
          this.#log(`all background processes terminated`)
        })
        fs.writeFileSync(this.#setupstatefile, "setup completed")
      } else {
        this.#log(`service ${this.#id} has already has been configured.`)
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
  async #waitForDependOnServices() {
    return new Promise((resolve) => {
      if (
        this.#options.execconfig.depend_on &&
        this.#options.execconfig.depend_on.length > 0
      ) {
        const dependOnServices = this.#options.execconfig.depend_on
        this.#log(`waiting for depend_on services ${dependOnServices}`)
        const interval = setInterval(async () => {
          let depend_on_services_started = true
          for (let i = 0; i < dependOnServices.length; i++) {
            const depend_on_service = dependOnServices[i]
            const service = this.#serviceManager.getService(depend_on_service)
            if (service) {
              this.#log(
                `checking services ${service.id} status ${service.status} and setup ${service.isSetup}.`
              )

              // Make sure all system services are configured.
              if (
                (service.status == ServiceStatus.AVAILABLE ||
                  service.status == ServiceStatus.INSTALLED) &&
                service.isSetup
              ) {
                this.#log(`service ${service.id} is available and ready.`)
                depend_on_services_started = true
                break
              }
              //Make sure all the services are started.
              if (service.status != ServiceStatus.STARTED) {
                depend_on_services_started = false
                break
              }
            }
          }
          if (depend_on_services_started) {
            this.#log(`all dependent services started`)
            clearInterval(interval)
            resolve(true)
          }
        }, 1000)
      } else {
        resolve(true)
      }
    })
  }
}
