<template>
  <div class="app-wrapper">
    <router-view />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import { getModule } from "vuex-module-decorators"
  // import * as themeHelpers from "@/utils/theme"
  import AppData from "@/store/Modules/AppData"
  const appDataModule = getModule(AppData)

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
        appDataModule.setServicesStopped()
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
          const reqServicesStarted = requiredServices.every(
            (el: { status: string }) => el.status === "120"
          )
          if (!reqServicesStarted) {
            appDataModule.setServicesStopped()
            this.setServiceLoaded()
          } else {
            appDataModule.setServicesStarted()
          }
        }
      },
      setServiceLoaded() {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'api' does not exist on type 'Window & typeof globalThis'
        window.api?.response("sendServiceStatus", ({ id, output }) => {
          if (this.servicesToCheck.includes(id) && output === "120") {
            const idx = this.servicesToCheck.indexOf(id)
            this.servicesToCheck.splice(idx, 1)
            if (this.servicesToCheck.length === 0) {
              appDataModule.setServicesStarted()
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
