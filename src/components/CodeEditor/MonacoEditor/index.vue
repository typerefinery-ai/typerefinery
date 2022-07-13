<template>
  <div class="app">
    <div class="header" :class="{ 'menu-hidden': !mainMenuVisible }">
      <main-menu
        :main-menu-visible="mainMenuVisible"
        @toggle="toggleMainMenu"
      />
      <menu-bar :menu-bar-visible="mainMenuVisible" @toggle="toggleMainMenu" />
    </div>
    <!-- content -->
    <div class="iframe-container">
      <MonacoEditor
        theme="vs"
        :options="options"
        language="javascript"
        :height="600"
        :diffEditor="false"
      ></MonacoEditor>
    </div>
  </div>
</template>

<script>
  import ToggleButton from "primevue/togglebutton"
  import MenuBar from "@/components/Menu/MenuBar.vue"
  import MainMenu from "@/components/Menu/MainMenu.vue"
  import MonacoEditor from "./MonacoEditor.vue"

  export default {
    name: "App",
    components: {
      MonacoEditor,
      MenuBar,
      MainMenu,
      ToggleButton,
    },
    data() {
      return {
        showMainOverlayMenu: false,
        mainMenuVisible: true,
        checked: true,
        options: {
          colorDecorators: true,
          lineHeight: 24,
          tabSize: 2,
        },
        original: "",
        value: "",
        width: 800,
        theme: "vs",
        border: "dark",
      }
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
