<template>
  <div class="menu-bar">
    <!-- electron only icons -->
    <menu-item
      v-if="isElectron"
      tooltip="minimize"
      :on-click="() => handleMenu('min')"
    >
      <i class="pi pi-minus"></i>
    </menu-item>
    <menu-item
      v-if="isElectron"
      tooltip="maximize"
      :on-click="() => handleMenu('max')"
    >
      <max-icon :size="18" />
    </menu-item>
    <menu-item
      v-if="isElectron"
      tooltip="close"
      :on-click="() => handleMenu('close')"
    >
      <close-icon :size="18" />
    </menu-item>
  </div>
</template>

<script>
import Menu from "primevue/menu"
import CloseIcon from "vue-material-design-icons/Close.vue"
import MaxIcon from "vue-material-design-icons/CheckboxMultipleBlankOutline.vue"
import * as electronHelpers from "@/utils/electron"
import MenuItem from "../MenuItem.vue"

export default {
  name: "MenuBar",
  components: {
    CloseIcon,
    MaxIcon,
    Menu,
    MenuItem,
  },

  computed: {
    isElectron() {
      return electronHelpers.isElectron()
    },
  },

  methods: {
    handleMenu(e) {
      window.api?.request("menu-click", e)
    },
  },
}
</script>
