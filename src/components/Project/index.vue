<template>
  <div class="app">
    <div
      v-show="!focusMode"
      class="header"
      :class="{ 'menu-hidden': !mainMenuVisible }"
      @mouseleave="closeMainMenu"
    >
      <div class="tab-1-container">
        <div class="tab-1-item" @mouseover="openMainMenu">
          <router-link to="/home/project"> Project</router-link>
        </div>
        <div class="tab-1-item">
          <router-link to="/home/charts"> Charts</router-link>
        </div>
        <div class="tab-1-item">
          <router-link to="/home/maps"> Maps</router-link>
        </div>
        <div
          v-show="!mainMenuVisible"
          class="main-menu overlay"
          :class="{ show: showMainOverlayMenu }"
        >
          <div class="main-menu-item">New Project</div>
          <div class="main-menu-item">New Query</div>
          <div class="main-menu-item">New Connection</div>
        </div>
      </div>
      <div class="menu-bar">
        <div class="menu-item" @click="toggleTheme">T</div>
        <div class="menu-item" @click="toggleFocus">F</div>
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
        <div class="main-menu-item">New Project</div>
        <div class="main-menu-item">New Query</div>
        <div class="main-menu-item">New Connection</div>
        <div class="icon-wrapper" @click="toggleMainMenu">
          <v-icon large color="darken-2"> mdi-chevron-up </v-icon>
        </div>
      </div>
    </div>
    <project-content
      :focus="focusMode"
      @toggle-focus="toggleFocus"
      @toggle-theme="toggleTheme"
    />
  </div>
</template>

<script>
  import ProjectContent from "./ProjectContent"
  import Theme from "@/store/Modules/Theme"
  import { getModule } from "vuex-module-decorators"
  const themeModule = getModule(Theme)

  export default {
    name: "Project",
    components: { ProjectContent },

    data() {
      return {
        focusMode: false,
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

      toggleFocus() {
        this.focusMode = !this.focusMode
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import "./style.scss";
</style>
