<template>
  <div class="app">
    <div
      v-show="!focusMode"
      class="header"
      :class="{ 'menu-hidden': !mainMenuVisible }"
    >
      <main-menu
        :main-menu-visible="mainMenuVisible"
        @toggle="toggleMainMenu"
      />
      <menu-bar :menu-bar-visible="mainMenuVisible" @toggle="toggleMainMenu" />
    </div>
    <project-content :focus="focusMode" />
  </div>
</template>

<script>
  import ProjectContent from "./ProjectContent"
  import MainMenu from "@/components/MainMenu.vue"
  import MenuBar from "@/components/MenuBar.vue"
  import AppSettings from "@/store/Modules/AppSettings"
  import { getModule } from "vuex-module-decorators"
  const appSettings = getModule(AppSettings)

  export default {
    name: "Project",
    components: { ProjectContent, MenuBar, MainMenu },

    data() {
      return {
        showMainOverlayMenu: false,
        mainMenuVisible: true,
      }
    },
    computed: {
      focusMode() {
        return appSettings.focus
      },
    },
    methods: {
      toggleMainMenu() {
        this.mainMenuVisible = !this.mainMenuVisible
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import "./style.scss";
</style>
