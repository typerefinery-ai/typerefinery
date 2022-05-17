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
      id: 1,
      name: "API",
      description: "Fast API",
      enabled: false,
      status: -1,
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
      id: 2,
      name: "DB",
      description: "Database",
      enabled: false,
      status: 30,
      logoutput: "...",
      icon: "pi pi-database",
      servicetype: 10,
    },
  ]

  @Mutation
  setServiceStatus(args: Array<number>) {
    const [id, status] = args
    const idx = this.services.findIndex((s) => s.id === id)
    this.services[idx].status = status
  }

  @Mutation
  enableService(args: Array<number>) {
    const [id, status] = args
    const idx = this.services.findIndex((s) => s.id === id)
    this.services[idx].enabled = status == 120
  }

  servicestatus = {
    "-1": { name: "error", color: "red" },
    "0": { name: "disabled", color: "gray" },
    "30": { name: "stopped", color: "blue" },
    "60": { name: "stopping", color: "purple" },
    "90": { name: "starting", color: "yellow" },
    "120": { name: "started", color: "green" },
  }

  servicetype = {
    "10": { name: "local", icon: "pi pi-cog" },
    "20": { name: "online", icon: "pi pi-globe" },
  }
}
