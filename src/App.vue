<template>
  <router-view />
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import AppSettings from "@/store/Modules/AppSettings"
  import { getModule } from "vuex-module-decorators"
  import { setThemeURL } from "@/utils/theme"
  const appSettings = getModule(AppSettings)

  export default defineComponent({
    name: "App",

    created() {
      window.addEventListener("keydown", this.keyListener)
    },

    unmounted() {
      window.removeEventListener("keydown", this.keyListener)
    },

    methods: {
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
