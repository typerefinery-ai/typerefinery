<template>
  <div class="app-wrapper">
    <router-view :key="$route.path" />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import { getModule } from "vuex-module-decorators"
  // import * as themeHelpers from "@/utils/theme"
  import AppData from "@/store/Modules/AppData"
  import Services from "@/store/Modules/Services"
  const appDataModule = getModule(AppData)
  const servicesModule = getModule(Services)
  import Settings from "@/store/Modules/Settings"
  const settingsModule = getModule(Settings)

  export default defineComponent({
    name: "App",
    data() {
      return {
        servicesToCheck: [
          "fastapi",
          "typedb",
          "totaljs-flow",
          "totaljs-messageservice",
        ],
        servicesToCheckTypeDB: ["typedb-init", "typedb-sample"],
        serviceSuccessStatusCodes: ["120", "220"],
      }
    },
    async created() {
      // window.addEventListener("keydown", this.keyListener)
      console.log("App created")
      console.log("App checkServiceStatus")
      this.checkServiceStatus()
      console.log("App getGlobalEnv")
      this.getGlobalEnv()
      console.log("App window.api?.response", window["api"])
      console.log("AppListen to sendServiceStopped")
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'api' does not exist on type 'Window & typeof globalThis'
      window.api?.response("sendServiceStopped", () => {
        console.log("App sendServiceStopped")
        servicesModule.setServicesStopped()
      })
      console.log("App Listen to sendGlobalEnv")
      // listen for global env
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'api' does not exist on type 'Window & typeof globalThis'
      window.api?.response("sendGlobalEnv", async ({ globalenv }) => {
        console.log("App sendGlobalEnv", globalenv)
        servicesModule.setGlobalEnv(globalenv)
      })
    },

    // unmounted() {
    //   window.removeEventListener("keydown", this.keyListener)
    // },
    methods: {
      async getGlobalEnv() {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'ipc' does not exist on type 'Window & typeof globalThis'
        const { ipc } = window
        if (ipc && ipc.getGlobalEnv) {
          const globalenv = await ipc.getGlobalEnv()
          console.log("App getGlobalEnv value", globalenv)
          servicesModule.setGlobalEnv(globalenv)
        }
      },
      async checkServiceStatus() {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'ipc' does not exist on type 'Window & typeof globalThis'
        const { ipc } = window
        if (ipc && ipc.getServices) {
          const services = await ipc.getServices()
          const requiredServices = services.filter((el: { id: string }) =>
            this.servicesToCheck.includes(el.id)
          )
          console.log(requiredServices, "requiredServices")
          //FIXME: need to move this to service manager
          const reqServicesStarted = requiredServices.every(
            (el: { status: string }) =>
              this.serviceSuccessStatusCodes.includes(el.status)
          )
          console.log(reqServicesStarted, "reqServicesStarted")
          if (!reqServicesStarted) {
            servicesModule.setServicesStopped()
            this.setServiceLoaded()
          } else {
            servicesModule.setServicesStarted()
          }
        }
      },
      setServiceLoaded() {
        console.log("App setServiceLoaded window.api?.response", window["api"])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'api' does not exist on type 'Window & typeof globalThis'
        window.api?.response("sendServiceStatus", async ({ id, output }) => {
          console.log("sendServiceStatus app", id, output, "output")

          //HACK FIXME: this is a hack to enable the menu items when the services are started, this must done via a store mutation
          if (this.serviceSuccessStatusCodes.includes(output)) {
            const experienceObj = settingsModule.data.listOfMenu.filter(
              (element) => element.service == id
            )
            if (experienceObj.length > 0) {
              experienceObj.forEach((el) => {
                el.disabled = false
                el.icon = el.experienceIcon || el.icon
                settingsModule.updateMenuitem(el)
              })
            }
          }
          if (
            (this.servicesToCheck.includes(id) ||
              this.servicesToCheckTypeDB.includes(id)) &&
            this.serviceSuccessStatusCodes.includes(output)
          ) {
            const idx = this.servicesToCheck.indexOf(id)
            this.servicesToCheck.splice(idx, 1)
            const idxTypeDb = this.servicesToCheckTypeDB.indexOf(id)

            this.servicesToCheckTypeDB.splice(idxTypeDb, 1)
            servicesModule.data.isAvailableTypeDBInitAndSample = true
            if (
              this.servicesToCheck.length === 0 &&
              this.servicesToCheckTypeDB.length === 0
            ) {
              servicesModule.setServicesStarted()
            }
          }

          // for settingsModule.data.listOfMenu enable the menu items if service is equals None
          for (const [key, experienceObj] of Object.entries(
            settingsModule.data.listOfMenu
          )) {
            if (experienceObj.service.toLowerCase() == "none") {
              experienceObj.disabled = false
              experienceObj.icon =
                experienceObj.experienceIcon || experienceObj.icon
              settingsModule.updateMenuitem(experienceObj)
            }
          }

          // else if(this.servicesToCheck.includes(id) && !["100", "104", "105", "25", "1", "15", "20", "25", "30", "90", "50"].includes(output)){
          //   servicesModule.setServicesStopped()
          //   // restart this service
          //   await servicesModule.startService(id)

          // }
        })
      },
      // TODO: Fix this code
      // keyListener(e: { key: string; shiftKey: boolean }) {
      //   const { key, shiftKey } = e
      //   if (shiftKey && key === "F") {
      //     settingsModule.toggleFocus()
      //   } else if (shiftKey && key === "T") {
      //     const theme = settingsModule.data.theme === "dark" ? "light" : "dark"
      //     settingsModule.setTheme(theme)
      //     themeHelpers.setThemeURL(theme)
      //   }
      // },
    },
  })
</script>

<style lang="scss">
  @import "./styles/_main.scss";
</style>
