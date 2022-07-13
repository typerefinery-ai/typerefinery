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

export interface ServiceConfig {
  servicepath: string
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
  execservice?: ExecService
  executable?: {
    win32?: string
    default?: string
  }
  setup?: string[]
  env?: any
  commandline?: string
  commandlinecli?: string
  datapath?: string
  serviceorder?: 0
  depend_on?: string[]
  serviceport?: number
  servicehost?: string
  healthcheck?: HealthCheck
}

export interface ExecService {
  id?: string
  cli?: boolean
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
  #servicepath: string
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
  #status: ServiceStatus
  #abortController: AbortController
  #logsDir: string
  constructor(
    logsDir: string,
    logger: Logger,
    servicepath: string,
    servicedatapath: string,
    options: SericeConfigFile,
    events: ServiceEvents,
    serviceManager: ServiceManager
  ) {
    super()
    this.#options = options
    this.#abortController = new AbortController()
    this.#servicepath = servicepath
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
    this.#setup = this.#options.execconfig?.setup || []
    this.#status = this.#options.status || ServiceStatus.DISABLED
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
      path.basename(this.#servicepath) + ".setup"
    )
    this.#ensurePathToFile(this.#setupstatefile)

    // set service pid and check if its not running
    this.#servicepidfile = path.join(
      this.#servicedatapath,
      path.basename(this.#servicepath) + ".pid"
    )
    this.#ensurePathToFile(this.#servicepidfile)

    this.#checkRunning()
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
      .replaceAll("${SERVICE_PATH}", service.#servicepath)
      .replaceAll("${SERVICE_DATA_PATH}", service.#servicedatapath)
      .replaceAll("${SERVICE_PORT}", service.#serviceport + "")
      .replaceAll("${SERVICE_HOST}", service.#servicehost + "")
      .replaceAll("${SERVICE_LOG_PATH}", service.#logsDir + "")
  }

  get environmentVariables() {
    const envVar = this.#options.execconfig?.env || {}
    // for each attribute in envVar update is value
    for (const key in envVar) {
      if (envVar[key]) {
        const value = envVar[key]
        envVar[key] = this.#getServiceCommand(value, this)
      }
    }
    envVar["PYTHONPATH"] = this.#servicepath
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
      this.#status = ServiceStatus.STOPPED
      this.#log(
        `process ${this.#id} with pid ${
          this.#process?.pid
        } existed, service status is ${this.#status}`
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
        // if service is being executed by a file
        serviceCommandCli = this.#getServiceCommand(
          this.#options.execconfig.commandlinecli,
          this
        )
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
        // if service is being executed by a file
        serviceCommand = this.#getServiceCommand(
          this.#options.execconfig.commandline,
          this
        )
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
        const platform =
          process.platform == "win32" ? process.platform : "default"
        serviceExecutable = this.#options.execconfig.executable[platform]
        if (serviceExecutable == null) {
          serviceExecutable = this.#options.execconfig.executable.default
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

      const options: RequestOptions = {
        hostname: hostname,
        port: port,
        path: path,
        timeout: this.#healthCheck?.timeout || 1000,
      }
      try {
        const req = http.get(options, (res) => {
          if (res.statusCode == 200) {
            this.#status = ServiceStatus.STARTED
            this.#log(
              `http health check success, service status is ${this.#status}`
            )
          } else {
            this.#status = ServiceStatus.STOPPED
            this.#log(
              `http health check failed with status code ${
                res.statusCode
              }, service status is ${this.#status}`
            )
          }
        })
        req.on("error", (e) => {
          this.#status = ServiceStatus.STOPPED
          this.#log(
            `http health check request failed with error ${e}, service status is ${
              this.#status
            }`
          )
        })
      } catch (error) {
        this.#status = ServiceStatus.STOPPED
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
        this.#status = ServiceStatus.STARTED
        this.#log(`tcp health check success, service status ${this.#status}`)
        socket.end()
      })
      socket.on("error", (error) => {
        this.#status = ServiceStatus.STOPPED
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
    //quick fail already started
    if (this.#status == ServiceStatus.STARTED) {
      this.#log(
        `service ${this.#id} already started with pid ${this.#process?.pid}`
      )
      return
    }

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
        cwd: this.#servicesroot,
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

  #setStatus(output: ServiceStatus) {
    if (this.#events.sendServiceStatus) {
      this.#events.sendServiceStatus(this.#id, output)
      this.emit("status", this.#id, output)
    }
  }

  get isSetup() {
    if (!this.#options.execconfig.setup) {
      return true
    }
    return os.isPathExist(this.#setupstatefile)
  }

  async #doSetup() {
    if (this.#setup && this.#setup.length > 0) {
      if (!os.isPathExist(this.#setupstatefile)) {
        this.#log(
          `service ${
            this.#id
          } has not been been configured, executing setup commands.`
        )
        this.#status = ServiceStatus.INSTALLING

        let serviceExecutable = this.getServiceExecutable()

        // check if executing service is requested to be cli
        if (this.#options.execconfig.execservice) {
          // find service executable
          const execservice: ExecService = this.#options.execconfig.execservice
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

            this.#log(`executing using command cli ${serviceExecutable}`)
          }
        }
        //for each setup command in #setup, execute it

        for (let i = 0; i < this.#setup.length; i++) {
          const step = this.#setup[i]
          const setupCommand = this.#getServiceCommand(step, this)
          this.#log(`executing setup command ${setupCommand}`)
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
              this.#status = ServiceStatus.INSTALLED
              // create setup file to mark that setup already happened
              fs.writeFileSync(this.#setupstatefile, "")
            })
            .catch((err) => {
              this.#log(`setup command ${setupCommand} error ${err}`)
              this.#status = ServiceStatus.ERROR
            })
            .finally(() => {
              // this.#log(`setup command ${setupCommand} complete`)
            })
        }
      } else {
        this.#log(`service ${this.#id} has already has been configured.`)
      }
    }
  }

  #checkRunning() {
    // check if service is already running
    if (os.isPathExist(this.#servicepidfile)) {
      const pid = fs.readFileSync(this.#servicepidfile, "utf8")

      //check if service pid is runnin on linux
      if (process.platform == "win32") {
        os.runCommandWithCallBack(
          'tasklist /fi "PID eq ' + pid + '"',
          [],
          { signal: this.#abortController.signal },
          (data) => {
            if (data.includes("No tasks are running")) {
              // no process running
              this.#removeServicePidFile()
              this.#status = ServiceStatus.STOPPED
            } else {
              // process is running
              this.#status = ServiceStatus.STARTED
              this.#setStatus(ServiceStatus.STARTED)
              return
            }
          }
        )
      } else {
        os.runCommandWithCallBack(
          "ps -p " + pid + " -o pid=",
          [],
          { signal: this.#abortController.signal },
          (data) => {
            if (data.includes("No such process")) {
              // no process running
              this.#removeServicePidFile()
              this.#status = ServiceStatus.STOPPED
            } else {
              // process is running
              this.#status = ServiceStatus.STARTED
              this.#setStatus(ServiceStatus.STARTED)
              return
            }
          }
        )
      }
    } else {
      this.#status = ServiceStatus.STOPPED
    }
  }
}
