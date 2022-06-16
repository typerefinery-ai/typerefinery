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
import { createWriteStream, WriteStream } from "fs"
// import { dataPath, resourceBinary } from "./Resources"
import portfinder from "portfinder"
import { Readable, Writable } from "node:stream"

const serviceManagerLog = "servicemanager.log"

async function getPortFree(port: number, host: string) {
  // return new Promise((res) => {
  //   const srv = net.createServer()
  //   srv.listen(0, () => {
  //     const port: AddressInfo = srv.address() as AddressInfo
  //     srv.close((err) => res(port.port))
  //   })
  // })
  return portfinder
    .getPortPromise({ host: host, port: port })
    .then((port) => {
      return port
    })
    .catch((err) => {
      //
      // Could not get a free port, `err` contains the reason.
      //
    })
}

interface ServiceManagerEvents {
  sendServiceList: (serviceConfigList: object) => void
}

class ServiceManager {
  #serviceConfigFile = "service.json"
  #servicesroot: string
  #serviceConfigList: ServiceConfig[]
  #services: Service[]
  #serviceEvents: ServiceEvents
  #serviceManagerEvents: ServiceManagerEvents
  #logger: Logger
  #logsDir: string
  #logWritable: Writable
  #logWritablePath: string
  constructor(
    logsDir: string,
    logger: Logger,
    servicesroot: string,
    serviceEvents: ServiceEvents,
    serviceManagerEvents: ServiceManagerEvents
  ) {
    this.#logsDir = logsDir
    this.#servicesroot = servicesroot
    this.#logger = logger.forService("servicemanager")
    this.#services = new Array<Service>()
    this.#servicesroot = servicesroot
    this.#serviceEvents = serviceEvents
    this.#serviceManagerEvents = serviceManagerEvents
    this.#serviceConfigList = this.findServiceConfigs(this.#servicesroot)
    this.loadServices()
    // send list of services to app
    if (this.#serviceManagerEvents.sendServiceList) {
      this.#serviceManagerEvents.sendServiceList(this.#services)
    }
    this.#logWritablePath = path.join(logsDir, serviceManagerLog)
    this.#logWritable = createWriteStream(this.#logWritablePath, {
      flags: "a",
      mode: 0o666,
      highWaterMark: 0,
    })

    this.#logger.log("service manager log", this.#logWritablePath)
  }

  get log(): Writable {
    return this.#logWritable
  }

  // process all service configs and load Service objects
  loadServices() {
    this.#serviceConfigList.forEach((serviceConfig: ServiceConfig) => {
      // name, servicepath, servicesroot, servicetype, options
      this.#services.push(
        new Service(
          this.#logsDir,
          this.#logger,
          serviceConfig.servicepath,
          serviceConfig.options,
          this.#serviceEvents,
          this
        )
      )
    })
  }

  // find all service.json in services folder recursively
  findServiceConfigs(servicesPath: string): ServiceConfig[] {
    const serviceConfigList: ServiceConfig[] = []
    const servicesPathResolved = path.resolve(servicesPath)
    const globOptions = {
      cwd: servicesPathResolved,
      root: servicesPathResolved,
      nodir: true,
      nocase: true,
      nosort: false,
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
            // create new ServiceConfig object
            const serviceConfig: ServiceConfig = {
              servicepath: servicePathResolved,
              options: serviceFileConfig,
              events: this.#serviceEvents,
            }

            serviceConfigList.push(serviceConfig)
          } catch (error) {
            console.error(["findServiceConfigs", file, error])
          }
        }
      })
    return serviceConfigList
  }

  // get list of all seervices
  getServices(): Service[] {
    return this.#services
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
  startAll() {
    for (const service of this.#services) {
      service.start()
    }
  }

  // // start a service
  // start(serviceConfig) {
  //   const service = new Service(serviceConfig)
  //   this.services.push(service)
  //   service.start()
  // }

  // stop all services
  stopAll() {
    for (const service of this.#services) {
      service.stop()
    }
  }

  // // add a service to the list
  // addService(service) {
  //   this.services.push(service)
  // }

  // // get a service by name
  // getService(name) {
  //   for (const service of this.services) {
  //     if (service.name == name) {
  //       return service
  //     }
  //   }
  //   return null
  // }

  // // get a service by file
  // getServiceByFile(file) {
  //   for (const service of this.services) {
  //     if (service.file == file) {
  //       return service
  //     }
  //   }
  //   return null
  // }

  // // get a service by path
  // getServiceByPath(path) {
  //   for (const service of this.services) {
  //     if (service.path == path) {
  //       return service
  //     }
  //   }
  //   return null
  // }
}

export { type ServiceManagerEvents, ServiceManager }
