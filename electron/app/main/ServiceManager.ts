import * as path from "path"
import {
  type ServiceConfig,
  type ServiceEvents,
  type SericeConfigFile,
  Service,
} from "./Service"
import fs from "fs"
import glob from "glob"
import { Logger } from "./Logger"
import { createWriteStream } from "fs"
import { Writable } from "node:stream"
import { getPortFree } from "./Utils"

const serviceManagerLog = "servicemanager.log"

interface ServiceManagerEvents {
  sendServiceList: (serviceConfigList: Service[]) => void
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
    this.#logWritable = createWriteStream(this.#logWritablePath, {
      flags: "a",
      mode: 0o666,
      highWaterMark: 0,
    })

    this.#logger.log("service manager log", this.#logWritablePath)
    this.#serviceConfigList = []
    this.#globalenv = globalenv
    this.reload()
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

  reload(restart = false) {
    if (restart) {
      this.stopAll()
    }
    this.#clearServices()

    this.#loadServiceConfigs()
    this.#loadServices()

    // send list of services to app
    if (this.#serviceManagerEvents.sendServiceList) {
      this.#serviceManagerEvents.sendServiceList(this.#services)
    }

    if (restart) {
      this.startAll()
    }
  }

  #clearServices() {
    this.#services = []
  }

  // process all service configs and load Service objects
  #loadServices() {
    this.#serviceConfigList.forEach((serviceConfig: ServiceConfig) => {
      // name, servicepath, servicesroot, servicetype, options
      this.#services.push(
        new Service(
          this.#logsDir,
          this.#logger,
          serviceConfig.servicehome,
          serviceConfig.servicepath,
          serviceConfig.servicesdataroot,
          serviceConfig.options,
          this.#serviceEvents,
          this
        )
      )
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
    glob
      .sync(`**/${this.#serviceConfigFile}`, globOptions)
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
            // data path is service path + service name
            let servicesDataRootResolved = path.join(
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
                // data path is service path + service name + platform name
                servicesDataRootResolved = path.join(
                  this.#servicesdataroot,
                  path.basename(servicePathResolved),
                  path.basename(platformServicePath)
                )
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

  // start all services
  async startAll() {
    const orderedServiceList = this.#services.sort(
      (service1: Service, service2: Service) => {
        const serviceorder1 = service1.options.execconfig?.serviceorder ?? 99
        const serviceorder2 = service2.options.execconfig?.serviceorder ?? 99

        if (serviceorder1 < serviceorder2) {
          return -1
        } else if (serviceorder2 < serviceorder1) {
          return 1
        }
        return 0
      }
    )

    for (const service of orderedServiceList) {
      this.#logger.log(
        `ordered service ${service.id} : ${
          service.options.execconfig?.serviceorder ?? 99
        }`
      )
    }
    for (const service of orderedServiceList) {
      this.#logger.log(`starting service ${service.id}`)
      await service.start(this.globalEnv)
      // collect global environment variables
      // add service.globalEnvironmentVariables to #globalenv
      Object.assign(this.#globalenv, service.globalEnvironmentVariables)

      this.#logger.log(
        `service started ${service.id} : ${service.status} : ${service.isSetup}`
      )
    }
    this.#logger.log("all services started.")
  }

  // stop all services
  async stopAll() {
    for (const service of this.#services) {
      this.#logger.log(`stopping service ${service.id}`)
      await service.stop()
      this.#logger.log(`service ${service.id} stopped.`)
    }
    this.#logger.log("all services stopped.")
  }
}

export { type ServiceManagerEvents, ServiceManager }
