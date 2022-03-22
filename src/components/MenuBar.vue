<template>
  <div class="menu-bar">
    <div class="menu-item" @click="toggleLanguage">
      {{ $i18n.locale.toUpperCase() }}
    </div>
    <div class="menu-item" @click="toggleTheme">T</div>
    <div class="menu-item" @click="toggleFocus">F</div>
    <div class="menu-item">-</div>
    <div class="menu-item">o</div>
    <div class="menu-item">x</div>
  </div>
</template>

<script>
  import AppSettings from "@/store/Modules/AppSettings"
  import { getModule } from "vuex-module-decorators"
  const appSettings = getModule(AppSettings)

  console.log(appSettings)
  export default {
    name: "MenuBar",
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
    right: 0;
    top: 0;
    padding: 5px;
    border-bottom: 1px solid;
    border-left: 1px solid;

    .menu-item {
      cursor: pointer;
      width: 25px;
      height: 25px;
      border: 1px solid;

      display: flex;
      align-items: center;
      justify-content: center;

      &:not(:last-of-type) {
        margin-right: 2px;
      }

      .v-icon {
        font-size: 18px;
      }
    }
  }
</style>
