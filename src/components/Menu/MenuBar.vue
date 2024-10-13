<template>
  <div class="menu-bar" :class="{ focus: focus }">
    <!-- service icons -->
    <services-info :variant="'buttons'" />

    <!-- menu icons -->
    <menu-item
      v-if="!menuBarVisible"
      tooltip="show-menu-bar"
      :on-click="toggleView"
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
    <!-- <menu-item tooltip="toggle-focus" :on-click="toggleFocus">
      <focus-icon :size="18" />
    </menu-item> -->
    <menu-item tooltip="profile" :on-click="openSettings">
      <span v-if="nickname" class="mr-1">{{ nickname }}</span>
      <user-icon :size="18" />
    </menu-item>

    <window-controls v-if="isElectron" />
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
  import { getModule } from "vuex-module-decorators"
  import { setThemeURL } from "@/utils/theme"
  import { locales } from "@/i18n"
  import Menu from "primevue/menu"
  import UserIcon from "vue-material-design-icons/AccountCircle.vue"
  import FocusIcon from "vue-material-design-icons/BullseyeArrow.vue"
  import ServicesInfo from "@/components/Services"
  import WindowControls from "./WindowControls.vue"
  import MenuItem from "./MenuItem.vue"
  import Settings from "@/store/Modules/Settings"
  import Auth from "@/store/Modules/Auth"
  import * as electronHelpers from "@/utils/electron"
  const settingsModule = getModule(Settings)
  const authModule = getModule(Auth)

  export default {
    name: "MenuBar",
    components: {
      FocusIcon,
      ServicesInfo,
      UserIcon,
      Menu,
      MenuItem,
      WindowControls,
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
            value: "https://github.com/typerefinery-ai/typerefinery",
          },
        ],
      }
    },

    computed: {
      nickname() {
        const { alias, username } = authModule.data
        return alias ? alias : username
      },
      focus() {
        return settingsModule.data.focus
      },
      theme() {
        return settingsModule.data.theme
      },
      isElectron() {
        return electronHelpers.isElectron()
      },
    },

    created() {
      const systemLang = navigator.language.substring(0, 2)
      const theme = settingsModule?.data.theme || "light"
      const langInStore = settingsModule?.data.language
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
        settingsModule.setLanguage(lang)
        this.$i18n.locale = lang
      },

      toggleTheme() {
        const theme = this.theme === "dark" ? "light" : "dark"
        settingsModule.setTheme(theme)
        setThemeURL(theme)
      },

      toggleFocus() {
        settingsModule.toggleFocus()
        settingsModule.resizeView()
      },

      toggleMenu(event) {
        this.$refs.menu.toggle(event)
      },

      toggleHelp(event) {
        this.$refs.help.toggle(event)
      },

      openLink(url) {
        window.open(url, "_blank")
      },

      openSettings() {
        settingsModule.openSettingsDialog("profile/alias")
      },

      toggleView() {
        this.$emit("toggle")
        settingsModule.resizeView()
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
