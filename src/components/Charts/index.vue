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
      <iframe
        src="https://charticulator.com/app/index.html"
        frameborder="0"
      ></iframe>
    </div>
  </div>
</template>

<script>
  import MenuBar from "@/components/Menu/MenuBar.vue"
  import MainMenu from "@/components/Menu/MainMenu.vue"
  export default {
    name: "Charts",
    components: { MenuBar, MainMenu },
    data() {
      return {
        showMainOverlayMenu: false,
        mainMenuVisible: true,
      }
    },
    methods: {
      toggleMainMenu() {
        this.mainMenuVisible = !this.mainMenuVisible
      },

      openMainMenu() {
        if (!this.mainMenuVisible) {
          this.showMainOverlayMenu = true
        }
      },

      closeMainMenu() {
        if (this.showMainOverlayMenu) {
          this.showMainOverlayMenu = false
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import "./style.scss";
</style>
