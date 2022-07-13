/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import store from "../index"
import sampleData from "@/data/default.json"

@Module({
  name: "Services",
  store: store,
  dynamic: true,
  preserveState: localStorage.getItem("services") !== null,
})
export default class Services extends VuexModule {
  data = sampleData.services

  // services = [
  //   {
  //     id: "fastapi",
  //     name: "API",
  //     description: "Fast API",
  //     enabled: false,
  //     status: "-1",
  //     logoutput: "...",
  //     icon: "pi pi-cog",
  //     servicetype: 10,
  //     actions: {
  //       stop: {
  //         name: "stop",
  //         path: "...",
  //         commanline: "...",
  //       },
  //       start: {
  //         name: "start",
  //         path: "...",
  //         commanline: "...",
  //       },
  //     },
  //   },
  //   {
  //     id: "typedb",
  //     name: "DB",
  //     description: "Database",
  //     enabled: false,
  //     status: "30",
  //     logoutput: "...",
  //     icon: "pi pi-database",
  //     servicetype: 10,
  //   },
  // ]

  @Action({ rawError: true })
  async getServices() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'ipc' does not exist on type 'Window & typeof globalThis'
    const { ipc } = window
    if (ipc && ipc.getServices) {
      const services = await ipc.getServices()
      this.context.commit("setServices", services)
    }
    // console.log(services)
    // this.services = []
    // services.forEach((service: any) => {
    //   this.services.push(service)
    // })
    return this.data.services
  }

  get serviceList() {
    return this.data.services
  }

  get serviceStatusNames() {
    const list = {}
    for (const [key, value] of Object.entries(this.data.serviceStatusEnum)) {
      list[value.name] = key
    }
    return list
  }

  get serviceStatusColorList() {
    const list = {}
    for (const [key, value] of Object.entries(this.data.serviceStatusEnum)) {
      list[value.name] = value.color
    }
    return list
  }

  get serviceStatusList() {
    const list: object[] = []
    for (const [key, value] of Object.entries(this.data.serviceStatusEnum)) {
      list.push({
        name: value.name,
        value: key,
      })
    }
    return list
  }

  get serviceTypeNames() {
    const servicetypenamesList = {}
    for (const [key, value] of Object.entries(this.data.serviceTypeEnum)) {
      servicetypenamesList[value.name] = key
    }
    return servicetypenamesList
  }

  get serviceTypeList() {
    const list: object[] = []
    for (const [key, value] of Object.entries(this.data.serviceTypeEnum)) {
      list.push({
        name: value.name,
        value: parseFloat(key),
      })
    }
    return list
  }

  // get service count by status
  get serviceCountByStatus() {
    const list: object[] = []
    for (const [key, value] of Object.entries(this.data.serviceStatusEnum)) {
      const count = this.data.services.filter(
        (service: any) => service.status === key
      ).length
      if (count > 0) {
        list.push({
          name: value.name,
          value: key,
          color: value.color,
          count: count,
        })
      }
    }
    return list
  }

  // @Mutation
  // serviceNames() {
  //   const list = {}
  //   for (const [key, value] of Object.entries(this.services)) {
  //     list[value.name] = value.name
  //   }
  //   return list
  // }

  @Mutation
  setServices(payload) {
    this.data.services = payload
  }

  // @Mutation
  // setServiceStatus(serviceId: string, statusId: string) {
  //   const idx = this.services.findIndex((s) => s.id === serviceId)
  //   this.services[idx].status = statusId
  // }

  @Action({ rawError: true })
  async updateServiceStatusByStatusName(payload: object) {
    this.context.commit("setServiceStatusPayload", payload)
  }

  // @Mutation
  // setServiceStatusPayload(payload: object) {
  //   const serviceId = payload["name"]
  //   const statusName = payload["status"]
  //   Object.entries(this.serviceStatusEnum).find(([key, value]) => {
  //     console.log([serviceId, statusName, key, value.name])
  //     if (value.name === statusName) {
  //       console.log([serviceId, key, "set"])
  //       const idx = this.services.findIndex((s) => s.id === serviceId)
  //       this.services[idx].status = key
  //     }
  //   })
  // }

  // @Mutation
  // setServiceStatusByStatusName(serviceId: string, statusName: string) {
  //   const statusId = this.serviceStatusNames[statusName]
  //   this.setServiceStatus(serviceId, statusId)
  // }

  // @Action({ rawError: true })
  // async updateServiceLogByName(payload: object) {
  //   this.context.commit("setServiceLogPayload", payload)
  // }

  // @Mutation
  // setServiceLogPayload(payload: object) {
  //   const serviceId = payload["name"]
  //   const logstring = payload["log"]
  //   console.log([payload, serviceId, logstring])
  //   const idx = this.services.findIndex((s) => s.id === serviceId)
  //   console.log([serviceId, logstring, idx])
  //   if (serviceId > 0) {
  //     this.services[idx].logoutput =
  //       this.services[idx].logoutput + "\n" + logstring
  //   } else {
  //     //for each service update logoutput
  //     for (const [key, value] of Object.entries(this.services)) {
  //       this.services[key].logoutput =
  //         this.services[key].logoutput + "\n" + logstring
  //     }
  //   }
  // }

  // @Mutation
  // setServiceLogByName(serviceId: string, logstring: string) {
  //   const idx = this.services.findIndex((s) => s.id === serviceId)
  //   console.log([serviceId, logstring, this.services[idx]])
  //   this.services[idx].logoutput =
  //     this.services[idx].logoutput + "\n" + logstring
  // }
}
