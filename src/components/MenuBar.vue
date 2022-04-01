<template>
  <div class="menu-bar" :class="{ focus: focus }">
    <div
      v-if="!menuBarVisible"
      v-tooltip.bottom="$t(`tooltips.show-menu-bar`)"
      class="menu-item hover:text-primary hover:border-primary"
      @click="$emit('toggle')"
    >
      <chevron-down :size="18" />
    </div>
    <div
      v-tooltip.bottom="$t(`tooltips.change-language`)"
      class="menu-item hover:text-primary hover:border-primary"
      @click="toggleMenu"
    >
      <i class="pi pi-globe"></i>
    </div>
    <div
      v-tooltip.bottom="$t(`tooltips.toggle-theme`)"
      class="menu-item hover:text-primary hover:border-primary"
      @click="toggleTheme"
    >
      <i
        v-if="theme === 'light'"
        class="pi pi-sun"
        style="font-weight: bold"
      ></i>
      <i v-else class="pi pi-moon"></i>
    </div>
    <div
      v-tooltip.bottom="$t(`tooltips.toggle-focus`)"
      class="menu-item hover:text-primary hover:border-primary"
      @click="toggleFocus"
    >
      <focus-icon :size="18" />
    </div>
    <div
      v-tooltip.bottom="$t(`tooltips.minimize`)"
      class="menu-item hover:text-primary hover:border-primary"
      @click="handleMenu('min')"
    >
      <i class="pi pi-minus"></i>
    </div>
    <div
      v-tooltip.bottom="$t(`tooltips.maximize`)"
      class="menu-item hover:text-primary hover:border-primary"
      @click="handleMenu('max')"
    >
      <max-icon :size="18" />
    </div>
    <div
      v-tooltip.left="$t(`tooltips.close`)"
      class="menu-item hover:text-primary hover:border-primary"
      @click="handleMenu('close')"
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
  import { getModule } from "vuex-module-decorators"
  import ChevronDown from "vue-material-design-icons/ChevronDoubleDown.vue"
  import FocusIcon from "vue-material-design-icons/BullseyeArrow.vue"
  import CloseIcon from "vue-material-design-icons/Close.vue"
  import MaxIcon from "vue-material-design-icons/CheckboxMultipleBlankOutline.vue"
  import AppSettings from "@/store/Modules/AppSettings"
  import { setThemeURL } from "@/utils/theme"
  const appSettings = getModule(AppSettings)

  export default {
    name: "MenuBar",
    components: {
      ChevronDown,
      FocusIcon,
      CloseIcon,
      MaxIcon,
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
      theme() {
        return appSettings.theme
      },
    },

    created() {
      const theme = appSettings?.theme || "light"
      setThemeURL(theme)
    },

    methods: {
      toggleLanguage(value) {
        appSettings.setLanguage(value)
        this.$i18n.locale = value
        this.$refs.menu.toggle()
      },

      toggleTheme() {
        const theme = this.theme === "dark" ? "light" : "dark"
        appSettings.setTheme(theme)
        setThemeURL(theme)
      },

      toggleFocus() {
        appSettings.toggleFocus()
      },

      toggleMenu(event) {
        this.$refs.menu.toggle(event)
      },

      handleMenu(e) {
        window.api?.request("menu-click", e)
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
    -webkit-app-region: no-drag;

    &.focus {
      right: 6px;
      top: 6px;
    }

    .menu-item {
      cursor: pointer;
      width: 25px;
      height: 25px;
      border: 1px solid var(--surface-border);

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
    background: var(--surface-c);
  }
</style>
