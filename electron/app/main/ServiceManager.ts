import * as path from "path"
import {
  type ServiceConfig,
  type ServiceEvents,
  type SericeConfigFile,
  ServiceStatus,
  Service,
} from "./Service"
import fs from "fs"
import glob from "glob"
import { Logger } from "./Logger"
import { Writable } from "node:stream"
import { getPortFree } from "./Utils"

const serviceManagerLog = "servicemanager.log"

interface ServiceManagerEvents {
  sendServiceList: (serviceConfigList: Service[]) => void
  sendGlobalEnv: (globalenv: { [key: string]: string }) => void
}

class ServiceManager {
  #serviceConfigFile = "service.json"
  #servicesroot: string
  #servicesdataroot: string
  #serviceConfigList: ServiceConfig[]
  #services: Service[]
  #serviceEvents: ServiceEvents
  #serviceManagerEvents: ServiceManagerEvents
  #logger: Logger
  #logsDir: string
  #logWritable: Writable
  #logWritablePath: string
  #globalenv: { [key: string]: string } = {}
  constructor(
    logsDir: string,
    logger: Logger,
    servicesroot: string,
    servicesdataroot: string,
    serviceEvents: ServiceEvents,
    serviceManagerEvents: ServiceManagerEvents,
    globalenv: { [key: string]: string } = {}
  ) {
    this.#logsDir = logsDir
    this.#servicesroot = servicesroot
    this.#servicesdataroot = servicesdataroot
    this.#logger = logger.forService("servicemanager")
    this.#services = new Array<Service>()
    this.#serviceEvents = serviceEvents
    this.#serviceManagerEvents = serviceManagerEvents

    this.#logWritablePath = path.join(logsDir, serviceManagerLog)
    this.#logWritable = fs.createWriteStream(this.#logWritablePath, {
      flags: "a",
      mode: 0o666,
      highWaterMark: 0,
    })

    this.#logger.log("service manager log", this.#logWritablePath)
    this.#serviceConfigList = []
    this.#globalenv = globalenv
    const startReload = new Date()
    this.#logger.log("service manager reload start", startReload)
    this.reload()
    this.#logger.log(
      "service manager reload end",
      this.elapsedTime(startReload)
    )
  }

  get log(): Writable {
    return this.#logWritable
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
      this.#logger.log(
        "service manager stop all",
        this.elapsedTime(startReload)
      )
      await this.stopAll()
    }

    this.#logger.log("service manager clear", this.elapsedTime(startReload))
    this.#clearServices()
    this.#logger.log(
      "service manager load configs",
      this.elapsedTime(startReload)
    )
    this.#loadServiceConfigs()
    this.#logger.log(
      "service manager load services",
      this.elapsedTime(startReload)
    )
    this.#loadServices()
    this.#logger.log(
      "service manager update global env",
      this.elapsedTime(startReload)
    )
    this.#updateGlobalEnv()
    this.#logger.log(
      "service manager sort services",
      this.elapsedTime(startReload)
    )
    this.#sortServices()

    // send list of services to app
    if (this.#serviceManagerEvents.sendServiceList) {
      this.#logger.log(
        "service manager send list of services to app",
        this.elapsedTime(startReload)
      )
      this.#serviceManagerEvents.sendServiceList(this.#services)
    }

    // send globalenv to app
    if (this.#serviceManagerEvents.sendGlobalEnv) {
      this.#logger.log(
        "service manager send globalenv to app",
        this.elapsedTime(startReload)
      )
      this.#serviceManagerEvents.sendGlobalEnv(this.#globalenv)
    }

    if (restart) {
      this.#logger.log(
        "service manager send startAll start",
        this.elapsedTime(startReload)
      )
      await this.startAll()
      this.#logger.log(
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
            this.#logger.log("findServiceConfigs", file, error)
          }
        }
      })
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
    this.#logger.log("starting all services.")
    this.#sortServices()

    for (const service of this.#services) {
      this.#logger.log(
        `ordered service ${service.id} : ${
          service.options.execconfig?.serviceorder ?? 99
        }`
      )
    }

    //generate global environment variables to pass to all services
    this.getGlobalEnv()

    for (const service of this.#services) {
      this.#logger.log(`starting service ${service.id}`)
      await service.start(this.globalEnv, [service.id], true, forceInstall)
      // collect global environment variables from service and add to globalenv in case they have changed
      Object.assign(this.#globalenv, service.globalEnvironmentVariables)

      this.#logger.log(
        `service started ${service.id} : ${service.status} : ${service.isSetup}`
      )
    }
    this.#logger.log("all services started.")
  }

  // stop all services
  async stopAll() {
    this.#sortServices(true)
    for (const service of this.#services) {
      this.#logger.log(`stopping service ${service.id}`)
      await service.stop()
      this.#logger.log(`service ${service.id} stopped.`)
    }
    this.#logger.log("all services stopped.")
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
}

export { type ServiceManagerEvents, ServiceManager }
