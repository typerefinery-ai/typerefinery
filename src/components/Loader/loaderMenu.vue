<template>
  <div class="menu-bar" :class="{ focus: focus }">
    <!-- menu icons -->

    <window-controls v-if="isElectron" />
  </div>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import { setThemeURL } from "@/utils/theme"

  import WindowControls from "@/components/Menu/WindowControls.vue"

  import Settings from "@/store/Modules/Settings"

  import * as electronHelpers from "@/utils/electron"
  const settingsModule = getModule(Settings)

  export default {
    name: "LoaderMenu",
    components: {
      WindowControls,
    },

    props: {
      menuBarVisible: { type: Boolean, required: true },
    },

    emits: ["toggle"],

    computed: {
      isElectron() {
        return electronHelpers.isElectron()
      },
    },

    created() {
      const theme = settingsModule?.data.theme || "light"
      setThemeURL(theme)
    },
  }
</script>

<style lang="scss">
  #body {
    .menu-bar {
      display: flex;
      position: absolute;
      right: 5px;
      top: 5px;
      -webkit-app-region: no-drag;
    }
  }
</style>
