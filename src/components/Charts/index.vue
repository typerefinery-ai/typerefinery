<template>
  <div class="app">
    <div
      class="header"
      :class="{ 'menu-hidden': !mainMenuVisible }"
      @mouseleave="closeMainMenu"
    >
      <div class="tab-1-container">
        <div class="tab-1-item">
          <router-link to="/home/project">
            {{ $t("components.project.project") }}</router-link
          >
        </div>
        <div class="tab-1-item active" @mouseover="openMainMenu">
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
          v-if="!mainMenuVisible"
          class="main-menu overlay"
          :class="{ show: showMainOverlayMenu }"
        >
          <div class="main-menu-item">
            {{ $t("components.project.load-data") }}
          </div>
          <div class="main-menu-item">
            {{ $t("components.project.load-links") }}
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
          {{ $t("components.project.load-data") }}
        </div>
        <div class="main-menu-item">
          {{ $t("components.project.load-links") }}
        </div>
        <div class="icon-wrapper" @click="toggleMainMenu">
          <v-icon large color="darken-2"> mdi-chevron-up </v-icon>
        </div>
      </div>
    </div>
    <div class="iframe-container">
      <iframe
        src="https://charticulator.com/app/index.html"
        frameborder="0"
      ></iframe>
    </div>
  </div>
</template>

<script>
  import MenuBar from "@/components/MenuBar.vue"
  export default {
    name: "Charts",
    components: { MenuBar },
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
