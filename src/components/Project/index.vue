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
          <router-link to="/home/project">
            {{ $t("components.project.project") }}</router-link
          >
        </div>
        <div class="tab-1-item">
          <router-link to="/home/charts">
            {{ $t("components.project.charts") }}</router-link
          >
        </div>
        <div class="tab-1-item">
          <router-link to="/home/maps">
            {{ $t("components.project.maps") }}</router-link
          >
        </div>
        <div
          v-show="!mainMenuVisible"
          class="main-menu overlay"
          :class="{ show: showMainOverlayMenu }"
        >
          <div class="main-menu-item">
            {{ $t("components.project.new-project") }}
          </div>
          <div class="main-menu-item">
            {{ $t("components.project.new-query") }}
          </div>
          <div class="main-menu-item">
            {{ $t("components.project.new-connection") }}
          </div>
        </div>
      </div>
      <menu-bar />
      <div
        v-if="!mainMenuVisible"
        class="icon-wrapper-down"
        @click="toggleMainMenu"
      >
        <v-icon large color="darken-2"> mdi-chevron-down </v-icon>
      </div>

      <div v-if="mainMenuVisible" class="main-menu">
        <div class="main-menu-item">
          {{ $t("components.project.new-project") }}
        </div>
        <div class="main-menu-item">
          {{ $t("components.project.new-query") }}
        </div>
        <div class="main-menu-item">
          {{ $t("components.project.new-connection") }}
        </div>
        <div class="icon-wrapper" @click="toggleMainMenu">
          <v-icon large color="darken-2"> mdi-chevron-up </v-icon>
        </div>
      </div>
    </div>
    <project-content :focus="focusMode" />
  </div>
</template>

<script>
  import ProjectContent from "./ProjectContent"
  import MenuBar from "@/components/MenuBar.vue"
  import AppSettings from "@/store/Modules/AppSettings"
  import { getModule } from "vuex-module-decorators"
  const appSettings = getModule(AppSettings)

  export default {
    name: "Project",
    components: { ProjectContent, MenuBar },

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
