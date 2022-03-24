<template>
  <div class="menu-bar" :class="{ focus: focus }">
    <div
      v-if="!menuBarVisible"
      v-tooltip.bottom="'Show Menu Bar'"
      class="menu-item hover:text-indigo-600 hover:border-indigo-600"
      @click="$emit('toggle')"
    >
      <chevron-down :size="18" />
    </div>
    <div
      v-tooltip.bottom="'Toggle Language'"
      class="menu-item hover:text-indigo-600 hover:border-indigo-600"
      @click="toggleLanguage"
    >
      <globe-icon :size="18" />
    </div>
    <div
      v-tooltip.bottom="'Toggle Theme'"
      class="menu-item hover:text-indigo-600 hover:border-indigo-600"
      @click="toggleTheme"
    >
      <palette-icon :size="18" />
    </div>
    <div
      v-tooltip.bottom="'Toggle Focus'"
      class="menu-item hover:text-indigo-600 hover:border-indigo-600"
      @click="toggleFocus"
    >
      <focus-icon :size="18" />
    </div>
    <div
      v-tooltip.bottom="'Minimize'"
      class="menu-item hover:text-indigo-600 hover:border-indigo-600"
    >
      <minus-icon :size="18" />
    </div>
    <div
      v-tooltip.bottom="'Maximize'"
      class="menu-item hover:text-indigo-600 hover:border-indigo-600"
    >
      <max-icon :size="18" />
    </div>
    <div
      v-tooltip.left="'Close'"
      class="menu-item hover:text-indigo-600 hover:border-indigo-600"
    >
      <close-icon :size="18" />
    </div>
  </div>
</template>

<script>
  import ChevronDown from "vue-material-design-icons/ChevronDoubleDown.vue"
  import FocusIcon from "vue-material-design-icons/BullseyeArrow.vue"
  import PaletteIcon from "vue-material-design-icons/PaletteOutline.vue"
  import CloseIcon from "vue-material-design-icons/Close.vue"
  import MinusIcon from "vue-material-design-icons/Minus.vue"
  import MaxIcon from "vue-material-design-icons/CheckboxMultipleBlankOutline.vue"
  import GlobeIcon from "vue-material-design-icons/Web.vue"

  import AppSettings from "@/store/Modules/AppSettings"
  import { getModule } from "vuex-module-decorators"
  const appSettings = getModule(AppSettings)

  console.log(appSettings)
  export default {
    name: "MenuBar",
    components: {
      ChevronDown,
      FocusIcon,
      PaletteIcon,
      CloseIcon,
      MinusIcon,
      MaxIcon,
      GlobeIcon,
    },
    props: {
      menuBarVisible: { type: Boolean, required: true },
    },
    emits: ["toggle"],
    computed: {
      focus() {
        return appSettings.focus
      },
    },
    methods: {
      toggleLanguage() {
        const value = this.$i18n.locale === "hi" ? "en" : "hi"
        appSettings.setLanguage(value)
        this.$i18n.locale = value
      },

      toggleTheme() {
        const theme = appSettings.theme
        if (theme === "greenTheme") {
          appSettings.setTheme("redTheme")
        } else {
          appSettings.setTheme("greenTheme")
        }
      },

      toggleFocus() {
        appSettings.toggleFocus()
      },
    },
  }
</script>

<style lang="scss">
  .menu-bar {
    display: flex;
    position: absolute;
    right: 5px;
    top: 5px;
    /* padding: 5px; */
    /* border-bottom: 1px solid #dee2e6;
    border-left: 1px solid #dee2e6; */
    color: #495057;

    &.focus {
      right: 6px;
      top: 6px;
    }

    .menu-item {
      cursor: pointer;
      width: 25px;
      height: 25px;
      border: 1px solid #dee2e6;

      display: flex;
      align-items: center;
      justify-content: center;

      &:not(:last-of-type) {
        margin-right: 2px;
      }

      .material-design-icon {
        display: flex;
      }
    }
  }
</style>
