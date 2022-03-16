<template>
  <v-app :theme="theme">
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
  import Theme from "./store/Modules/Theme"
  import { getModule } from "vuex-module-decorators"
  const themeModule = getModule(Theme)
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
        return themeModule.theme
      },
    },
  })
</script>

<style lang="scss">
  @import "./styles/_main.scss";
</style>
