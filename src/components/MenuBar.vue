<template>
  <div class="menu-bar" :class="{ focus: focus }">
    <!-- service icons -->
    <service-icons />

    <!-- menu icons -->
    <menu-item
      v-if="!menuBarVisible"
      tooltip="show-menu-bar"
      :on-click="() => $emit('toggle')"
    >
      <i class="pi pi-angle-double-down"></i>
    </menu-item>
    <menu-item tooltip="help" :on-click="toggleHelp">
      <i class="pi pi-info-circle"></i>
    </menu-item>
    <menu-item tooltip="change-language" :on-click="toggleMenu">
      <i class="pi pi-globe"></i>
      </menu-item>
    <menu-item tooltip="toggle-theme" :on-click="toggleTheme">
      <i v-if="theme === 'light'" class="pi pi-sun font-bold"></i>
      <i v-else class="pi pi-moon"></i>
    </menu-item>
    <menu-item tooltip="toggle-focus" :on-click="toggleFocus">
      <focus-icon :size="18" />
    </menu-item>
    <menu-item tooltip="profile" :on-click="openSettings">
      <span v-if="nickname" class="mr-1">{{ nickname }}</span>
      <user-icon :size="18" />
    </menu-item>

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

  <!-- language options -->
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

  <!-- help options -->
  <Menu ref="help" class="help-menu" :model="helpMenu" :popup="true">
    <template #item="{ item }">
      <div class="p-menuitem-link" @click="openLink(item.value)">
        {{ item.label }} <i class="pi pi-external-link"></i>
      </div>
    </template>
  </Menu>
</template>

<script>
  import Menu from "primevue/menu"
  import { getModule } from "vuex-module-decorators"
  import UserIcon from "vue-material-design-icons/AccountCircle.vue"
  import FocusIcon from "vue-material-design-icons/BullseyeArrow.vue"
  import CloseIcon from "vue-material-design-icons/Close.vue"
  import MaxIcon from "vue-material-design-icons/CheckboxMultipleBlankOutline.vue"
  import AppSettings from "@/store/Modules/AppSettings"
  import ServiceIcons from "./Services.vue"
  import { setThemeURL } from "@/utils/theme"
  import isElectron from "@/utils/is-electron"
  import { locales } from "@/i18n"
  import MenuItem from "./MenuItem.vue"
  const appSettings = getModule(AppSettings)
  import Auth from "@/store/Modules/Auth"
  const appAuth = getModule(Auth)

  export default {
    name: "MenuBar",
    components: {
      FocusIcon,
      CloseIcon,
      MaxIcon,
      ServiceIcons,
      UserIcon,
      Menu,
      MenuItem,
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
        helpMenu: [
          {
            label: "Docs",
            value: "https://typerefinery.ai/",
          },
          {
            label: "Github",
            value: "https://github.com/innovolve-ai/typerefinery",
          },
        ],
      }
    },

    computed: {
      nickname() {
        return appAuth.alias ? appAuth.alias : appAuth.username
      },
      focus() {
        return appSettings.focus
      },
      theme() {
        return appSettings.theme
      },
      isElectron() {
        return isElectron()
      },
    },

    created() {
      const systemLang = navigator.language.substring(0, 2)
      const theme = appSettings?.theme || "light"
      const langInStore = appSettings?.language
      setThemeURL(theme)

      if (systemLang && !langInStore) {
        if (locales.includes(systemLang)) {
          this.setLanguage(systemLang)
          window.api?.request("lang-change", systemLang)
        }
      } else {
        window.api?.request("lang-change", langInStore)
      }
    },

    methods: {
      toggleLanguage(value) {
        this.setLanguage(value)
        window.api?.request("lang-change", value)
        this.$refs.menu.toggle()
      },

      setLanguage(lang) {
        appSettings.setLanguage(lang)
        this.$i18n.locale = lang
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

      toggleHelp(event) {
        this.$refs.help.toggle(event)
      },

      handleMenu(e) {
        window.api?.request("menu-click", e)
      },

      openLink(url) {
        window.open(url, "_blank")
      },

      openSettings() {
        appSettings.openSettingsDialog("profile/alias")
      },
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

    .help-menu.p-menu {
      width: auto;
      font-size: 14px;

      .p-menuitem-link {
        width: 8rem;

        i {
          margin-left: 5px;
          font-size: 10px;
          position: relative;
          top: 1px;
        }
      }
    }

    .p-menuitem-link {
      &.active {
        background: var(--surface-c);
      }
    }
  }
</style>
