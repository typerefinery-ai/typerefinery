<template>
  <router-view />
</template>

<script lang="ts">
  import AppSettings from "@/store/Modules/AppSettings"
  import { getModule } from "vuex-module-decorators"
  const appSettings = getModule(AppSettings)
  import { defineComponent } from "vue"

  export default defineComponent({
    name: "App",

    data() {
      return {
        // theme: themeModule.theme,
      }
    },
    computed: {
      theme() {
        return appSettings.theme
      },
    },
  })
</script>

<style lang="scss">
  @import "./styles/_main.scss";
</style>
