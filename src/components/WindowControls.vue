<template>
  <menu-item tooltip="minimize" @click.prevent="onMinimize">
    <window-minimize-icon :size="18" />
  </menu-item>
  <menu-item v-if="!isMaximized" tooltip="maximize" @click.prevent="onMaximize">
    <window-maximize-icon :size="18" />
  </menu-item>
  <menu-item v-if="isMaximized" tooltip="restore" @click.prevent="onRestore">
    <window-restore-icon :size="18" />
  </menu-item>
  <menu-item tooltip="close" @click.prevent="onClose">
    <window-close-icon :size="18" />
  </menu-item>
</template>

<script>
  import WindowCloseIcon from "vue-material-design-icons/WindowClose.vue"
  import WindowRestoreIcon from "vue-material-design-icons/WindowRestore.vue"
  import WindowMaximizeIcon from "vue-material-design-icons/WindowMaximize.vue"
  import WindowMinimizeIcon from "vue-material-design-icons/WindowMinimize.vue"
  import * as electronHelpers from "@/utils/electron"
  import MenuItem from "./MenuItem.vue"
  import { ref } from "vue"

  export default {
    name: "WindowControls",
    components: {
      WindowCloseIcon,
      WindowRestoreIcon,
      WindowMaximizeIcon,
      WindowMinimizeIcon,
      MenuItem,
    },

    setup() {
      const { ipc } = window
      const isMinimized = ref(false)
      ipc.isMinimized().then((is) => {
        isMinimized.value = is
      })

      const isMaximized = ref(false)
      ipc.isMaximized().then((is) => {
        isMaximized.value = is
      })

      const isNormal = ref(false)
      ipc.isNormal().then((is) => {
        isNormal.value = is
      })
      return {
        ipc,
        isMaximized,
        isMinimized,
        isNormal,
      }
    },

    computed: {
      isElectron() {
        return electronHelpers.isElectron()
      },
    },

    methods: {
      onClose() {
        console.log("onClose")
        this.ipc.close()
      },
      onMinimize() {
        console.log("onMinimize")
        this.ipc.minimize().then(() => {
          this.isMinimized = true
          this.isMaximized = false
          this.isNormal = false
        })
      },
      onMaximize() {
        console.log("onMaximize")
        this.ipc.maximize().then(() => {
          this.isMinimized = false
          this.isMaximized = true
          this.isNormal = false
        })
      },
      onRestore() {
        console.log("onRestore")
        this.ipc.unmaximize().then(() => {
          this.isMinimized = false
          this.isMaximized = false
          this.isNormal = true
        })
      },
    },
  }
</script>
