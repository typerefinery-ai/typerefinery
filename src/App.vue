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
      }
    },
    async created() {
      // window.addEventListener("keydown", this.keyListener)
      this.checkServiceStatus()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'api' does not exist on type 'Window & typeof globalThis'
      window.api?.response("sendServiceStopped", () => {
        servicesModule.setServicesStopped()
      })
    },

    // unmounted() {
    //   window.removeEventListener("keydown", this.keyListener)
    // },
    methods: {
      async checkServiceStatus() {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'ipc' does not exist on type 'Window & typeof globalThis'
        const { ipc } = window
        if (ipc && ipc.getServices) {
          const services = await ipc.getServices()
          const requiredServices = services.filter((el: { id: string }) =>
            this.servicesToCheck.includes(el.id)
          )
          console.log(requiredServices, "requiredServices")
          const reqServicesStarted = requiredServices.every(
            (el: { status: string }) => el.status === "120"
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
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'api' does not exist on type 'Window & typeof globalThis'
        window.api?.response("sendServiceStatus", async ({ id, output }) => {
          console.log(id, output, "output")
          if (output == "120") {
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
            (output === "120" || output === "50")
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
