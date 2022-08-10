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
    <flowUI />
  </div>
</template>

<script>
  import MainMenu from "@/components/Menu/MainMenu.vue"
  import MenuBar from "@/components/Menu/MenuBar.vue"
  import FlowUI from "@/components/Workflow"
  import Settings from "@/store/Modules/Settings"
  import { getModule } from "vuex-module-decorators"
  const settingsModule = getModule(Settings)

  export default {
    name: "Workflow",
    components: { MenuBar, MainMenu, FlowUI },

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
    methods: {
      toggleMainMenu() {
        this.mainMenuVisible = !this.mainMenuVisible
      },
    },
  }
</script>

<style scoped lang="scss">
  .app {
    box-sizing: border-box;
    height: 100vh;
    display: flex;
    flex-direction: column;

    .header {
      width: 100%;
      height: 75px;
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      position: relative;
      border-bottom: 1px solid var(--surface-border);
      box-sizing: border-box;

      &.menu-hidden {
        height: 36px;
      }
    }
  }
</style>
