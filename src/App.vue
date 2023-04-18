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
              experienceObj[0].disabled = false
              experienceObj[0].icon =
                settingsModule.data.previousIcon || experienceObj[0].icon
              settingsModule.data.previousIcon = ""
              settingsModule.updateMenuitem(experienceObj[0])
            }
          }
          if (this.servicesToCheck.includes(id) && output === "120") {
            const idx = this.servicesToCheck.indexOf(id)
            this.servicesToCheck.splice(idx, 1)
            if (this.servicesToCheck.length === 0) {
              servicesModule.setServicesStarted()
            }
          }
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
