<template>
  <div class="app">
    <div
      class="header"
      :class="{ 'menu-hidden': !mainMenuVisible }"
      @mouseleave="closeMainMenu"
    >
      <div class="tab-1-container">
        <div class="tab-1-item">
          <router-link to="/home/project"> Project</router-link>
        </div>
        <div class="tab-1-item">
          <router-link to="/home/charts"> Charts</router-link>
        </div>
        <div class="tab-1-item active" @mouseover="openMainMenu">
          <router-link to="/home/maps"> Maps</router-link>
        </div>
        <div
          v-if="!mainMenuVisible"
          class="main-menu overlay"
          :class="{ show: showMainOverlayMenu }"
        >
          <div class="main-menu-item">Load Data</div>
        </div>
      </div>
      <div class="menu-bar">
        <div class="menu-item" @click="toggleTheme">T</div>
        <div class="menu-item">F</div>
        <div class="menu-item">-</div>
        <div class="menu-item">o</div>
        <div class="menu-item">x</div>
      </div>
      <div
        v-if="!mainMenuVisible"
        class="icon-wrapper-down"
        @click="toggleMainMenu"
      >
        <v-icon large color="darken-2"> mdi-chevron-down </v-icon>
      </div>

      <div v-if="mainMenuVisible" class="main-menu">
        <div class="main-menu-item">Load Data</div>
        <div class="icon-wrapper" @click="toggleMainMenu">
          <v-icon large color="darken-2"> mdi-chevron-up </v-icon>
        </div>
      </div>
    </div>
    <div class="iframe-container">
      <iframe src="https://kepler.gl/demo" frameborder="0"></iframe>
    </div>
  </div>
</template>

<script>
  import Theme from "@/store/Modules/Theme"
  import { getModule } from "vuex-module-decorators"
  const themeModule = getModule(Theme)
  export default {
    name: "Maps",

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

      toggleTheme() {
        const theme = themeModule.theme
        if (theme === "greenTheme") {
          themeModule.setTheme("redTheme")
        } else {
          themeModule.setTheme("greenTheme")
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import "./style.scss";
</style>
