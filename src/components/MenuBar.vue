<template>
  <div class="menu-bar" :class="{ focus: focus }">
    <div
      v-if="!menuBarVisible"
      v-tooltip.bottom="$t(`tooltips.show-menu-bar`)"
      class="menu-item hover:text-indigo-600 hover:border-indigo-600"
      @click="$emit('toggle')"
    >
      <chevron-down :size="18" />
    </div>
    <div
      v-tooltip.bottom="$t(`tooltips.change-language`)"
      class="menu-item hover:text-indigo-600 hover:border-indigo-600"
      @click="toggle"
    >
      <globe-icon :size="18" />
    </div>
    <div
      v-tooltip.bottom="$t(`tooltips.toggle-theme`)"
      class="menu-item hover:text-indigo-600 hover:border-indigo-600"
      @click="toggleTheme"
    >
      <palette-icon :size="18" />
    </div>
    <div
      v-tooltip.bottom="$t(`tooltips.toggle-focus`)"
      class="menu-item hover:text-indigo-600 hover:border-indigo-600"
      @click="toggleFocus"
    >
      <focus-icon :size="18" />
    </div>
    <div
      v-tooltip.bottom="$t(`tooltips.minimize`)"
      class="menu-item hover:text-indigo-600 hover:border-indigo-600"
    >
      <minus-icon :size="18" />
    </div>
    <div
      v-tooltip.bottom="$t(`tooltips.maximize`)"
      class="menu-item hover:text-indigo-600 hover:border-indigo-600"
    >
      <max-icon :size="18" />
    </div>
    <div
      v-tooltip.left="$t(`tooltips.close`)"
      class="menu-item hover:text-indigo-600 hover:border-indigo-600"
    >
      <close-icon :size="18" />
    </div>
  </div>
  <Menu ref="menu" :model="langs" :popup="true">
    <template #item="{ item }">
      <div
        class="p-menuitem-link"
        :class="{ active: item.value === $i18n.locale }"
        @click="toggleLanguage(item.value)"
      >
        {{ item.label }}
      </div>
    </template>
  </Menu>
</template>

<script>
  import Menu from "primevue/menu"
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
      Menu,
    },
    props: {
      menuBarVisible: { type: Boolean, required: true },
    },
    emits: ["toggle"],
    data() {
      return {
        langs: [
          {
            label: "English",
            value: "en",
            command: (e) => {
              this.toggleLanguage(e)
            },
          },
          {
            label: "हिन्दी",
            value: "hi",
            command: (e) => {
              this.toggleLanguage(e)
            },
          },
        ],
      }
    },
    computed: {
      focus() {
        return appSettings.focus
      },
    },
    methods: {
      toggleLanguage(value) {
        appSettings.setLanguage(value)
        this.$i18n.locale = value
        this.$refs.menu.toggle()
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
      toggle(event) {
        this.$refs.menu.toggle(event)
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

  .p-menuitem-link.active {
    background: rgba(0, 0, 0, 0.04);
  }
</style>
