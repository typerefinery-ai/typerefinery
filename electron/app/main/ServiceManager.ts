import * as path from "path"
import {
  type ServiceConfig,
  type ServiceEvents,
  type SericeConfigFile,
  ServiceStatus,
  Service,
} from "./Service"
import fs, { WriteStream } from "fs"
import glob from "glob"
import { Logger } from "./Logger"
import { Writable } from "node:stream"
import { getPortFree, checkPortFree, getProcessPathForPID, getProcessPidForPort, stopProcess, tryParseInt } from "./Utils"
import { os } from "./Utils"
import e from "express"
//EventEmitter
// import { EventEmitter } from "events"

const serviceManagerLog = "servicemanager.log"

const DEFAULT_CONNECTION_MAX_PORT = 65535
const DEFAULT_SERVICE_ORDER = 99
const DEFAULT_EVENTS_LISTENERS = 100
const DEFAULT_PORT_RESOLVE_ATTEMPTS = 10

require('events').EventEmitter.defaultMaxListeners = DEFAULT_EVENTS_LISTENERS
// require('events').EventEmitter.prototype._maxListeners = 100
// //increase max listeners
// EventEmitter.prototype.setMaxListeners(100)
// const emitter = new EventEmitter()
// emitter.setMaxListeners(100)

interface ServiceManagerEvents {
  sendServiceList: (serviceConfigList: Service[]) => void
  sendGlobalEnv: (globalenv: { [key: string]: string }) => void
}

export interface ReservedPort {
  port: number //what is requested
  service: string
  type: string
  status: string,
  requestedPort: number // what was assigned
}
class ServiceManager {
  #id = "servicemanager"
  #serviceConfigFile = "service.json"
  #servicesroot: string
  #servicesdataroot: string
  #serviceConfigList: ServiceConfig[]
  #services: Service[]
  #serviceEvents: ServiceEvents
  #serviceManagerEvents: ServiceManagerEvents
  #logger: Logger
  #logsDir: string
  #stdout: WriteStream
  #stdoutLogFile: string
  #stderr: WriteStream
  #stderrLogFile: string
  #globalenv: { [key: string]: string } = {}
  #abortController: AbortController
  #servicePorts: { [key: string]: ReservedPort } = {}
  #servicePortsMin: number = -1
  #servicePortsMax: number = -1
  constructor(
    logsDir: string,
    logger: Logger,
    servicesroot: string,
    servicesdataroot: string,
    serviceEvents: ServiceEvents,
    serviceManagerEvents: ServiceManagerEvents,
    globalenv: { [key: string]: string } = {}
  ) {
    this.#abortController = new AbortController()
    this.#logsDir = logsDir
    this.#servicesroot = servicesroot
    this.#servicesdataroot = servicesdataroot
    this.#logger = logger.forService("servicemanager")
    this.#services = new Array<Service>()
    this.#serviceEvents = serviceEvents
    this.#serviceManagerEvents = serviceManagerEvents

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
    this.#log("info", `service error log ${this.#stderr.path}.`)
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

    this.#serviceConfigList = []
    this.#globalenv = globalenv
    const startReload = new Date()
    this.#log("service manager load start", startReload)
    this.reload()
    this.#log(
      "service manager load end",
      this.elapsedTime(startReload)
    )

    const startAchive = new Date()
    this.#log("service manager logs archive start", startAchive)
    //curtrnt logs
    this.#log(`archiving ${path.dirname(logsDir)}, current logs ${logsDir}`)
    //archive logs
    const parentFolder = path.dirname(logsDir)
    const archiveFolder = path.join(parentFolder, "_archive")
    this.archiveLogsInFolder(parentFolder, archiveFolder, logsDir)
    this.#log(
      "service manager load end",
      this.elapsedTime(startAchive)
    )

    this.removeOldLogs(archiveFolder, 30)

  }

  #ensurePathToFile(file: string) {
    this.#ensurePath(path.dirname(file))
  }

  #ensurePath(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }


  #error(...args: any[]) {
    this.#logger.log(args)
    this.#logWrite("error",args.join(" "))
  }

  #log(...args: any[]) {
    this.#logger.log(args)
    this.#logWrite("info",args.join(" "))
  }

  #warn(...args: any[]) {
    this.#logger.log(args)
    this.#logWrite("warn",args.join(" "))
  }

  // write to service log
  #logWrite(type: string, message: any) {
    if (this.#stdout && message) {
      const timestamp = this.#timestamp
      const serviceId = this.#id
      const newLine = "\n"
      this.#stdout.write(`${timestamp} ${type.toUpperCase()} ${serviceId} -- ${message}${newLine}`)
    }
  }

  // write to service error log
  #errorWrite(type: string, message: any) {
    if (this.#stderr && message) {
      const timestamp = this.#timestamp
      const serviceId = this.#id
      const newLine = "\n"
      this.#stderr.write(`${timestamp} ${type.toUpperCase()} ${serviceId} -- ${message}${newLine}`)
    }
  }

  /**
   * get string timestamp
   * @returns timestamp
   */
  get #timestamp(): string {
    return new Date().toISOString()
  }

  getGlobalEnv(): { [key: string]: string } {
    //for each service get globalenv
    this.#services.forEach((service: Service) => {
      const serviceGlobalEnv = service.globalEnvironmentVariables
      Object.keys(serviceGlobalEnv).forEach((key: string) => {
        this.#globalenv[key] = serviceGlobalEnv[key]
      })
    })
    return this.#globalenv
  }

  get globalEnv(): { [key: string]: string } {
    return this.#globalenv
  }

  elapsedTime(start: Date): number {
    return (new Date().getTime() - start.getTime()) / 1000
  }

  async reload(restart = false) {
    const startReload = new Date()
    if (restart) {
      this.#log(
        "service manager stop all",
        this.elapsedTime(startReload)
      )
      await this.stopAll()
    }

    this.#log("service manager clear", this.elapsedTime(startReload))
    this.#clearServices()
    this.#log(
      "service manager load configs",
      this.elapsedTime(startReload)
    )
    this.#loadServiceConfigs()
    this.#log(
      "service manager load services",
      this.elapsedTime(startReload)
    )
    this.#loadServices()
    this.#log(
      "service manager update global env",
      this.elapsedTime(startReload)
    )
    this.#updateGlobalEnv()
    this.#log(
      "service manager sort services",
      this.elapsedTime(startReload)
    )
    this.#sortServices()

    // send list of services to app
    if (this.#serviceManagerEvents.sendServiceList) {
      this.#log(
        "service manager send list of services to app",
        this.elapsedTime(startReload)
      )
      this.#serviceManagerEvents.sendServiceList(this.#services)
    }

    // send globalenv to app
    if (this.#serviceManagerEvents.sendGlobalEnv) {
      this.#log(
        "service manager send globalenv to app",
        this.elapsedTime(startReload)
      )
      this.#serviceManagerEvents.sendGlobalEnv(this.#globalenv)
    }

    if (restart) {
      this.#log(
        "service manager send startAll start",
        this.elapsedTime(startReload)
      )
      await this.startAll()
      this.#log(
        "service manager send startAll end",
        this.elapsedTime(startReload)
      )
    }
  }

  #clearServices() {
    this.#services = []
  }

  #updateGlobalEnv() {
    this.#globalenv = this.getGlobalEnv()
    this.#pushGLobalEnvToServices()

    if (this.#serviceManagerEvents.sendGlobalEnv) {
      this.#serviceManagerEvents.sendGlobalEnv(this.#globalenv)
    }
  }

  #pushGLobalEnvToServices() {
    this.#services.forEach((service: Service) => {
      service.setGlobalEnvironmentVariables(this.#globalenv)
    })
  }

  // process all service configs and load Service objects
  #loadServices() {
    this.#log("loading services.")
    this.#serviceConfigList.forEach((serviceConfig: ServiceConfig) => {
      // name, servicepath, servicesroot, servicetype, options
      const service = new Service(
        this.#logsDir,
        this.#logger,
        serviceConfig.servicehome,
        serviceConfig.servicepath,
        serviceConfig.servicesdataroot,
        serviceConfig.options,
        this.#serviceEvents,
        this
      )

      // service.on("status", (id: string, status: any) => {
      //   // update global env
      //   console.log("\n\n\nservice status", id, status)
      //   if (
      //     status == ServiceStatus.STARTED ||
      //     status == ServiceStatus.COMPLETED
      //   ) {
      //     console.log("\n\n\nupdating env")
      //     this.#updateGlobalEnv()
      //   }
      // })
      service.on("globalEnv", (id: string, globalEnv: any) => {
        // update global env
        Object.assign(this.#globalenv, globalEnv)
        this.#pushGLobalEnvToServices()
      })

      this.#services.push(service)
    })
  }

  #loadServiceConfigs() {
    this.#serviceConfigList = this.#findServiceConfigs(this.#servicesroot)
  }

  // find all service.json in services folder recursively
  #findServiceConfigs(servicesPath: string): ServiceConfig[] {
    this.#log("locating service configs.")
    const serviceConfigList: ServiceConfig[] = []
    const servicesPathResolved = path.resolve(servicesPath)
    const globOptions = {
      cwd: servicesPathResolved,
      root: servicesPathResolved,
      nodir: true,
      nocase: true,
      nosort: true,
      silent: true,
      matchBase: true,
      dot: true,
      realpath: true,
    }
    glob //this loads all service.json files from services folder and its direct subfolders.
      .sync(`*/${this.#serviceConfigFile}`, globOptions)
      .forEach((file: string) => {
        const stat = fs.statSync(file)
        if (stat.isFile()) {
          // read service.json
          try {
            const serviceFileConfig: SericeConfigFile = JSON.parse(
              fs.readFileSync(file, "utf8")
            )

            const servicePathResolved = path.resolve(path.dirname(file))

            // detect if platfrom paths exist and use them as service path
            const platfromPath =
              process.platform == "win32" ||
              process.platform == "darwin" ||
              process.platform == "linux"
                ? process.platform
                : ""
            let platformServicePath = servicePathResolved
            let servicePlatformPathResolved = servicePathResolved
            // data path is service data root + service name
            const servicesDataRootResolved = path.join(
              this.#servicesdataroot,
              path.basename(servicePathResolved)
            )

            if (platfromPath) {
              platformServicePath = path.join(servicePathResolved, platfromPath)
              if (
                fs.existsSync(platformServicePath) &&
                fs.statSync(platformServicePath).isDirectory()
              ) {
                servicePlatformPathResolved = platformServicePath
              }
            }
            // create new ServiceConfig object
            const serviceConfig: ServiceConfig = {
              servicehome: servicePathResolved,
              servicepath: servicePlatformPathResolved,
              servicesdataroot: servicesDataRootResolved,
              options: serviceFileConfig,
              events: this.#serviceEvents,
            }

            serviceConfigList.push(serviceConfig)
          } catch (error) {
            this.#log("findServiceConfigs", file, error)
          }
        }
      })
    this.#log(`found service configs: ${serviceConfigList.length}`)
    return serviceConfigList
  }

  getPorts(): { [key: string]: ReservedPort } {
    return this.#servicePorts
  }

  // get list of all seervices
  getServices(): Service[] {
    return this.#services
  }

  // get list of all seervices
  getServicesSimple(): any[] {
    return this.#services.map((service: Service) => {
      return service.getSimple()
    })
  }

  // get service by id
  getService(id: string): Service {
    return this.#services.find((service: Service) => {
      return service.id === id
    }) as Service
  }

  #updatePortStats(port: number) {
    if (this.#servicePortsMin == -1 || port < this.#servicePortsMin) {
      this.#servicePortsMin = port
    }
    if (this.#servicePortsMax == -1 || port > this.#servicePortsMax) {
      this.#servicePortsMax = port
    }
  }

  #addServicePort(port: number, serviceId: string = "", type: string = "", status: string = "", requested: number) {
    this.#updatePortStats(port)
    const reservedPort: ReservedPort = {
      port: port,
      service: serviceId,
      type: type,
      status: status,
      requestedPort: requested
    }
    this.#servicePorts[port + ""] = reservedPort
    this.#log(`addServicePort for ${serviceId} port ${port} status ${status} requested ${requested}, service ports count ${Object.keys(this.#servicePorts).length}`)
  }

  #updatePortStatus(port: number, status: string) {
    if (this.#servicePorts[port + ""]) {
      this.#servicePorts[port + ""].status = status
    }
  }

  #getPortStatus(port: number): string {
    return this.#servicePorts[port + ""] ? this.#servicePorts[port + ""].status : ""
  }

  #updateServicePort(port: number, serviceId: string = "", type: string = "", status: string = "", newPort: number = -1) {
    //remove old port
    var oldSatus = ""
    if (this.#servicePorts[port + ""]) {
      oldSatus = this.#servicePorts[port + ""].status
      delete this.#servicePorts[port + ""]
    }

    this.#addServicePort(newPort, serviceId, type, status, port)
    this.#warn(`updateServicePort for ${serviceId} port ${newPort} status ${oldSatus} -> ${status}}`)
  }

  isPortsMapped(ports: { [key: string]: number }): boolean {
    let isMapped = true

    Object.keys(ports).forEach((key: string) => {
      const port = ports[key]

      if (port > 0 && this.#getPortStatus(port) != "available") {
        isMapped = false
      }
    })

    return isMapped
  }

  #isServicePortReserved(port: any) {
    //check if #servicePorts has entry
    return this.#servicePorts[port + ""] ? true : false
  }

  #nextServicePort() {
    return Number(this.#servicePortsMax) + 1
  }

  async reserveServicePort(port: number = 0, host = "localhost", serviceId = "", type = "") {
    this.#log(`reserveServicePort ${port} ${host} ${serviceId} ${type}`)
    let requestedPort: number = port
    let nextReservedPort: number = port
    let resolvedPort: number = port
    let isPortReserved = false
    let isPortResolved = false
    let useNextMaxPort = false
    let isPortInUse = false
    if (requestedPort > 0) {

      //is this port already reserved by another service
      if (this.#isServicePortReserved(requestedPort)) {
        nextReservedPort = this.#nextServicePort()
        this.#addServicePort(nextReservedPort, serviceId, type, "conflict", port)
        isPortReserved = true
        const reservedPort: ReservedPort = this.#servicePorts[port + ""]
        this.#warn(`service ${serviceId} has declared service port ${type} with value ${port} which is reserved by ${reservedPort.service} as ${reservedPort.type}, trying to find next avilable port ${requestedPort}.`)
        //this port is taken, try using next port
        useNextMaxPort = true
      } else {

        //reserve port for a resolution, first service to reserve port will be the one to use it
        this.#addServicePort(requestedPort, serviceId, type, "checking", port)

        // //check if port is free
        // const portCheck = await checkPortFree(requestedPort, host)

        // if (portCheck == requestedPort) {
        //   isPortInUse = false
        // } else {
        //   isPortInUse = true
        //   this.#warn(`service ${serviceId} has declared service port ${type} with value ${port} which is in use by the system, trying to find next avilable port ${port}.`)
        // }

        //check if port is free
        //get pid using port
        const processPid = await getProcessPidForPort(port, this.#abortController)
        const isPortUsed = (processPid === "" ? false : true)

        this.#log(`getProcessPidForPort ${serviceId} port ${port} pid ${processPid}. isPortUsed ${isPortUsed}.`)
        // console.log(`getProcessPidForPort ${serviceId} port ${port} pid ${processPid}. isPortUsed ${isPortUsed}.`)

        this.#updatePortStatus(port, isPortUsed ? "used" : "free")

        //if port is used, check if it is used by same service
        if (isPortUsed) {

          const processPath = await getProcessPathForPID(port, this.#abortController)
          this.#log(`getProcessPathForPID ${serviceId} ${port} ${processPath}`)
          // console.log(`getProcessPathForPID ${serviceId} ${port} ${processPath}`)

          //some other service is using this port, find new port
          if (processPath == "") {
            useNextMaxPort = true
            nextReservedPort = this.#nextServicePort()
          } else {
            //is the service using this port the same service
            const service = this.getService(serviceId)
            const serviceExecutable = service.getServiceExecutable()
            const serviceExecutableResolved = path.resolve(serviceExecutable)
            const processPathResolved = path.resolve(processPath)
            this.#log(`serviceExecutable ${serviceExecutableResolved} processPath ${processPathResolved}`)
            // console.log(`serviceExecutable ${serviceExecutableResolved} processPath ${processPathResolved}`)
            if (serviceExecutableResolved == processPathResolved) {
              //this port is used by the same service, try to stop the service
              //is current service PID match
              const servicePid = service.processid
              this.#log(`servicePid ${serviceId} ${servicePid}`)
              if (servicePid > 0 && servicePid == processPid) {
                //this is the same service, try to stop it
                await service.stop()
                //port is now free
                isPortInUse = false
              } else {

                const stopService = await stopProcess(processPid, false, this.#abortController)
                this.#warn(`service stopProcess ${serviceId} ${processPid} output ${stopService}`)
                if (stopService) {
                  //service is stopped
                  isPortInUse = false
                  //double check
                  const processPid = await getProcessPidForPort(port, this.#abortController)
                  if (processPid === "") {
                    isPortInUse = false
                  } else {
                    isPortInUse = true
                    this.#error(`tried to stop service ${serviceId} ${processPid} but it is still running.`)
                  }
                } else {
                  isPortInUse = true
                  this.#warn(`could not stop service ${serviceId} ${processPid}.`)
                }
              }
            } else {
              isPortInUse = true
              this.#warn(`service ${serviceId} has declared service port ${type} with value ${port} which is in use by another service, trying to find next avilable port ${port}.`)
            }
          }
        } else {
          isPortInUse = false
          this.#updatePortStatus(port, "free")
        }
      }
    } else {
      useNextMaxPort = true
      nextReservedPort = this.#nextServicePort()
    }

    if (useNextMaxPort || isPortReserved || isPortInUse) {
      // console.log(`useNextMaxPort ${useNextMaxPort} isPortReserved ${isPortReserved} isPortInUse ${isPortInUse} serviceId ${serviceId} port ${port} nextReservedPort ${nextReservedPort}`)

      // try to reserve port for service check DEFAULT_PORT_RESOLVE_ATTEMPTS times
      let freeReservedPort: number = nextReservedPort
      for (let i = 0; i < DEFAULT_PORT_RESOLVE_ATTEMPTS; i++) {
        this.#updatePortStatus(port, "resolve try")
        freeReservedPort = await getPortFree(freeReservedPort, host)
        this.#warn(`getPortFree try A ${i} ${serviceId} ${freeReservedPort} next ${this.#nextServicePort()}.`)
        if (freeReservedPort > 0) {
          //found free port
          isPortResolved = true
          resolvedPort = freeReservedPort
          this.#updatePortStatus(port, "resolve found")
          break
        } else {
          //if port has been reserved by another service, try next port
          freeReservedPort = this.#nextServicePort()
        }

        this.#warn(`getPortFree try B ${i} ${serviceId} ${freeReservedPort}.`)
        //if port has been reserved by another service, try next port
        if (this.#isServicePortReserved(freeReservedPort)) {
          freeReservedPort = this.#nextServicePort()
          this.#warn(`getPortFree try C ${i} ${serviceId} ${freeReservedPort}.`)
        } else {
          isPortResolved = true
          resolvedPort = freeReservedPort
          break
        }
      }
    } else {
      isPortResolved = true
    }

    if (isPortResolved) {
      this.#updateServicePort(port, serviceId, type, "available", resolvedPort)
      return resolvedPort
    } else {
      this.#error(`service ${serviceId} could not reserve port ${port} for service ${type}.`)
      return -1
    }
  }

  #sortServices(reverse = false) {
    if (!reverse) {
      this.#services.sort((service1: Service, service2: Service) => {
        const serviceorder1 = service1.options.execconfig?.serviceorder ?? DEFAULT_SERVICE_ORDER
        const serviceorder2 = service2.options.execconfig?.serviceorder ?? DEFAULT_SERVICE_ORDER
        let returnvalue = 0
        // services with lower serviceorder value are started first
        if (serviceorder1 < serviceorder2) {
          returnvalue = -1
          // services with higher serviceorder value are started last
        } else if (serviceorder2 < serviceorder1) {
          returnvalue = 1
        }

        // services with same serviceorder value are sorted by dependancy
        // services that depend on other services are started after the services they depend on
        if (service1.isDependantOnService(service2.id)) {
          returnvalue = 1
        } else if (service2.isDependantOnService(service1.id)) {
          returnvalue = -1
        }
        return returnvalue
      })
    } else {
      this.#services.reverse()
    }
  }

  // start all services
  async startAll(forceInstall = false) {
    this.#log("starting all services.")
    this.#sortServices()

    for (const service of this.#services) {
      this.#log(
        `ordered service ${service.id} : ${
          service.options.execconfig?.serviceorder ?? DEFAULT_SERVICE_ORDER
        }`
      )
    }

    //generate global environment variables to pass to all services
    this.getGlobalEnv()

    for (const service of this.#services) {
      this.#log(`starting service ${service.id}`)
      await service.start(this.globalEnv, [service.id], true, forceInstall)
      // collect global environment variables from service and add to globalenv in case they have changed
      Object.assign(this.#globalenv, service.globalEnvironmentVariables)

      this.#log(
        `service started ${service.id} : ${service.status} : ${service.isSetup}`
      )
    }
    this.#log("all services started.")
  }

  // stop all services
  async stopAll() {
    this.#log("stopping all services.")
    this.#sortServices(true)
    for (const service of this.#services) {
      this.#log(`stopping service ${service.id}`)
      await service.stop()
      this.#log(`service ${service.id} stopped.`)
    }
    this.#log("all services stopped.")
  }

  hasRunningServices(): boolean {
    return this.#services.some((service: Service) => {
      return service.status === ServiceStatus.STARTED
    })
  }

  allServicesStopped(): boolean {
    return this.#services.every((service: Service) => {
      return service.status === ServiceStatus.STOPPED
    })
  }

  async pack7Zip(folderPath: string, archiveName: string, destination: string, deleteFiles = false) {
    return new Promise<void>((resolve, reject) => {
      this.#log(`packing ${folderPath} to ${archiveName}`)
      const archiveService = this.getService("archive")
      this.#log(`archive service ${archiveService}`)
      if (archiveService) {
        const serviceExec = archiveService.getServiceExecutable()
        this.#log(`archive service executable ${serviceExec}`)
        const commandArgs = ["a", "-t7z", archiveName, folderPath, (deleteFiles ? "-sdel" : "")]
        const executable = this.#getExecCommandRelativeToCWD(serviceExec, destination)
        this.#log(`archive command ${executable} ${commandArgs.join(" ")}`)
        const environmentVariables = archiveService.environmentVariables
        this.#log(`archive environment variables ${JSON.stringify(environmentVariables)}`)
        //exec path
        const execPath = environmentVariables["SERVICE_EXECUTABLE_HOME"]
        this.#log(`archive exec path ${execPath}`)
        os.runProcess(
          executable,
          commandArgs,
          {
            signal: this.#abortController.signal,
            cwd: execPath,
            // stdio: ["ignore", this.#stdout, this.#stderr],
            windowsHide: true,
          }
        )
          .then((result) => {
            this.#log(`shell command ${serviceExec} result -- ${result}`)
            // resolve()
          })
          .catch((err) => {
            this.#log(`shell command ${serviceExec} error -- ${err}`)
            // reject()
          })
      }
    })
  }

  #getExecCommandRelativeToCWD(command: string, cwd: string) {
    // return path.relative(cwd, command)
    // let commandFixed = command.replace(cwd, "." + path.sep)
    // if (!commandFixed.startsWith("." + path.sep)) {
    //   commandFixed = "." + path.sep + commandFixed
    // }

    return command.replace(cwd, "." + path.sep)
  }

  archiveLogsInFolder(parentFolder: string, archiveFolder: string, currentFolder: string) {
    // for each folder in parent folder that is not current folder create a zip file
    const folders = fs.readdirSync(parentFolder)
    const currentFolderName = path.basename(currentFolder)
    const archiveFolderName = path.basename(archiveFolder)
    // this.#log('archiveLogsInFolder', parentFolder, archiveFolder, currentFolder, folders, currentFolderName)
    folders.forEach((folder: string) => {
      if (folder !== currentFolderName && folder !== archiveFolderName) {
        const folderPath = path.join(parentFolder, folder)
        const stats = fs.statSync(folderPath)
        if (stats.isDirectory()) {
          const zipFile = path.join(archiveFolder, `${folder}.7z`)
          this.#log(`archiving ${folder} to ${zipFile}`)
          this.pack7Zip(folderPath, zipFile, parentFolder, true)
        }
      }
    })
  }

  // remove old logs
  removeOldLogs(archiveFolder: string, numberOfDays = 30) {
    //find all files in archive folder and remove files older than number of days
    const files = fs.readdirSync(archiveFolder)
    const currentTime = new Date().getTime()
    files.forEach((file: string) => {
      const filePath = path.join(archiveFolder, file)
      const stats = fs.statSync(filePath)
      const fileTime = stats.mtime.getTime()
      const diffTime = currentTime - fileTime
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays > numberOfDays) {
        this.#log(`removing old log file ${filePath}`)
        fs.unlinkSync(filePath)
      }
    })
  }

}

export { type ServiceManagerEvents, ServiceManager }
