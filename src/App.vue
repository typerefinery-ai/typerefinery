<template>
  <div class="app-wrapper">
    <router-view />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import AppSettings from "@/store/Modules/AppSettings"
  import { getModule } from "vuex-module-decorators"
  import * as themeHelpers from "@/utils/theme"
  const appSettings = getModule(AppSettings)
  import { mapGetters, mapActions } from "vuex"
  //todo: figure out why store not being loaded automatically in store/index.ts.
  import Services from "@/store/Modules/Services"

  export default defineComponent({
    name: "App",

    created() {
      window.addEventListener("keydown", this.keyListener)

      // // monitor service events
      // // @ts-expect-error ts-migrate(2339) FIXME: Property 'api' does not exist on type 'Window & typeof globalThis'
      // window.api?.response("service:status", (data) => {
      //   this.updateServiceStatusByStatusName(data)
      // })
      // // @ts-expect-error ts-migrate(2339) FIXME: Property 'api' does not exist on type 'Window & typeof globalThis'
      // window.api?.response("service:log", (data) => {
      //   this.updateServiceLogByName(data)
      // })
    },

    unmounted() {
      window.removeEventListener("keydown", this.keyListener)
    },
    methods: {
      ...mapActions({
        updateServiceLogByName: "Services/updateServiceLogByName",
        updateServiceStatusByStatusName:
          "Services/updateServiceStatusByStatusName",
      }),
      ...mapGetters({
        serviceTypeList: "Services/serviceTypeList",
        serviceStatusList: "Services/serviceStatusList",
        serviceStatusColorList: "Services/serviceStatusColorList",
        services: "Services/services",
      }),
      keyListener(e: { key: string; shiftKey: boolean }) {
        const { key, shiftKey } = e
        if (shiftKey && key === "F") {
          appSettings.toggleFocus()
        } else if (shiftKey && key === "T") {
          const theme = appSettings.theme === "dark" ? "light" : "dark"
          appSettings.setTheme(theme)
          localStorage.setItem("theme", theme)
          themeHelpers.setThemeURL(theme)
        }
      },
    },
  })
</script>

<style lang="scss">
  @import "./styles/_main.scss";
</style>
