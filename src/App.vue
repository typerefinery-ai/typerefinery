<template>
  <router-view />
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import AppSettings from "@/store/Modules/AppSettings"
  import { getModule } from "vuex-module-decorators"
  import { setThemeURL } from "@/utils/theme"
  const appSettings = getModule(AppSettings)
  import { mapGetters, mapActions } from "vuex"
  //todo: figure out why store not being loaded automatically in store/index.ts.
  import Services from "@/store/Modules/Services"

  export default defineComponent({
    name: "App",

    created() {
      window.addEventListener("keydown", this.keyListener)

      // monitor service events
      window.api?.response("service:status", (data) => {
        this.updateServiceStatusByStatusName(data)
      })
      window.api?.response("service:log", (data) => {
        this.updateServiceLogByName(data)
      })
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
      keyListener(e) {
        const { key, shiftKey } = e
        if (shiftKey && key === "F") {
          appSettings.toggleFocus()
        } else if (shiftKey && key === "T") {
          const theme = appSettings.theme === "dark" ? "light" : "dark"
          appSettings.setTheme(theme)
          setThemeURL(theme)
        }
      },
    },
  })
</script>

<style lang="scss">
  @import "./styles/_main.scss";
</style>
