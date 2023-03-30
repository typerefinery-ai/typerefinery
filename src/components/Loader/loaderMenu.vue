<template>
  <div
    :style="{ position: 'relative', top: 0, right: 0 }"
    class="menu-bar"
    :class="{ focus: focus }"
  >
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
