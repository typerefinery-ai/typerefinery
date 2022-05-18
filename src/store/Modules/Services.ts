import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"

const storeValue = localStorage.getItem("services")
const servicesInStore = storeValue ? JSON.parse(storeValue).Services : false

@Module({
  name: "Services",
  store: store,
  dynamic: true,
  preserveState: servicesInStore,
})
export default class Services extends VuexModule {
  services = [
    {
      id: "fastapi",
      name: "API",
      description: "Fast API",
      enabled: false,
      status: "-1",
      logoutput: "...",
      icon: "pi pi-cog",
      servicetype: 10,
      actions: {
        stop: {
          name: "stop",
          path: "...",
          commanline: "...",
        },
        start: {
          name: "start",
          path: "...",
          commanline: "...",
        },
      },
    },
    {
      id: "typedb",
      name: "DB",
      description: "Database",
      enabled: false,
      status: "30",
      logoutput: "...",
      icon: "pi pi-database",
      servicetype: 10,
    },
  ]
  @Mutation
  serviceNames() {
    const servicestatusnamesList = {}
    for (const [key, value] of Object.entries(this.services)) {
      servicestatusnamesList[value.name] = value.name
    }
    return servicestatusnamesList
  }

  @Mutation
  setServiceStatus(serviceId: string, statusId: string) {
    const idx = this.services.findIndex((s) => s.id === serviceId)
    this.services[idx].status = statusId
  }

  @Mutation
  setServiceStatusByStatusName(serviceId: string, statusName: string) {
    const statusId = this.serviceStatusNames()[statusName]
    this.setServiceStatus(serviceId, statusId)
  }

  serviceStatusEnum = {
    "-1": { name: "error", color: "red" },
    "0": { name: "disabled", color: "gray" },
    "30": { name: "stopping", color: "blue" },
    "60": { name: "stopped", color: "purple" },
    "90": { name: "starting", color: "yellow" },
    "120": { name: "started", color: "green" },
  }

  @Mutation
  serviceStatusNames() {
    const list = {}
    for (const [key, value] of Object.entries(this.serviceStatusEnum)) {
      list[value.name] = key
    }
    return list
  }

  @Mutation
  serviceStatusColorList() {
    const list = {}
    for (const [key, value] of Object.entries(this.serviceStatusEnum)) {
      list[value.name] = value.color
    }
    return list
  }

  @Mutation
  serviceStatusList() {
    const list: object[] = []
    for (const [key, value] of Object.entries(this.serviceStatusEnum)) {
      list.push({
        name: value.name,
        value: parseFloat(key),
      })
    }
    return list
  }

  serviceTypeEnum = {
    "10": { name: "local", icon: "pi pi-cog" },
    "20": { name: "online", icon: "pi pi-globe" },
  }

  @Mutation
  serviceTypeNames() {
    const servicetypenamesList = {}
    for (const [key, value] of Object.entries(this.serviceTypeEnum)) {
      servicetypenamesList[value.name] = key
    }
    return servicetypenamesList
  }

  @Mutation
  serviceTypeList() {
    const list: object[] = []
    for (const [key, value] of Object.entries(this.serviceTypeEnum)) {
      list.push({
        name: value.name,
        value: parseFloat(key),
      })
    }
    return list
  }
}
