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
import { getPortFree } from "./Utils"
import { os } from "./Utils"
import e from "express"

const serviceManagerLog = "servicemanager.log"

interface ServiceManagerEvents {
  sendServiceList: (serviceConfigList: Service[]) => void
  sendGlobalEnv: (globalenv: { [key: string]: string }) => void
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


  #log(...args: any[]) {
    this.#logger.log(args)
    this.#logWrite("info",args.join(" "))
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

  async getOpenPort(port = 0, host = "localhost") {
    return await getPortFree(port, host)
  }

  #sortServices(reverse = false) {
    if (!reverse) {
      this.#services.sort((service1: Service, service2: Service) => {
        const serviceorder1 = service1.options.execconfig?.serviceorder ?? 99
        const serviceorder2 = service2.options.execconfig?.serviceorder ?? 99
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
          service.options.execconfig?.serviceorder ?? 99
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
