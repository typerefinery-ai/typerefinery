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
  import MainMenu from "@/components/Menu/MainMenu.vue"
  import MenuBar from "@/components/Menu/MenuBar.vue"
  import Settings from "@/store/Modules/Settings"
  import FlowMessage from "@/store/Modules/FlowMessage"
  import { getModule } from "vuex-module-decorators"
  const settingsModule = getModule(Settings)
  const flowModule = getModule(FlowMessage)
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
        return settingsModule.data.focus
      },
    },
    mounted() {
      flowModule.initTMS()
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
