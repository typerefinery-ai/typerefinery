/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import store from "../index"
import sampleData from "@/data/default.json"
@Module({
  name: "Services",
  store: store,
  dynamic: true,
  // preserveState: localStorage.getItem("services") !== null,
})
export default class Services extends VuexModule {
  data = sampleData.services

  @Action({ rawError: true })
  async restartService(serviceid: string) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'ipc' does not exist on type 'Window & typeof globalThis'
    const { ipc } = window
    if (ipc && ipc.restartService) {
      await ipc.restartService(serviceid)
    }
  }

  @Action({ rawError: true })
  async stopService(serviceid: string) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'ipc' does not exist on type 'Window & typeof globalThis'
    const { ipc } = window
    if (ipc && ipc.stopService) {
      await ipc.stopService(serviceid)
    }
  }

  @Action({ rawError: true })
  async startService(serviceid: string) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'ipc' does not exist on type 'Window & typeof globalThis'
    const { ipc } = window
    if (ipc && ipc.startService) {
      await ipc.startService(serviceid)
    }
  }

  @Action({ rawError: true })
  async startAllServices() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'ipc' does not exist on type 'Window & typeof globalThis'
    const { ipc } = window
    if (ipc && ipc.startAll) {
      await ipc.startAll()
    }
  }

  @Action({ rawError: true })
  async stopAllServices() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'ipc' does not exist on type 'Window & typeof globalThis'
    const { ipc } = window
    if (ipc && ipc.stopAll) {
      await ipc.stopAll()
    }
  }

  @Action({ rawError: true })
  async getServices() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'ipc' does not exist on type 'Window & typeof globalThis'
    const { ipc } = window
    if (ipc && ipc.getServices) {
      const services = await ipc.getServices()
      this.context.commit("setServices", services)
    }
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
  setServices(payload: any) {
    this.data.services = payload
  }

  @Mutation
  setSelectedServices(payload: any) {
    this.data.selectedStatus = payload
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

  // services
  @Mutation
  setServicesStarted() {
    this.data.servicesStarted = true
  }

  @Mutation
  setServicesStopped() {
    this.data.servicesStarted = false
  }
}
