<template>
  <div>
    <div class="app">
      <div class="header" :class="{ 'menu-hidden': !mainMenuVisible }">
        <main-menu
          :main-menu-visible="mainMenuVisible"
          :sub-menu-visible="false"
          @toggle="toggleMainMenu"
        />
        <menu-bar
          :menu-bar-visible="mainMenuVisible"
          @toggle="toggleMainMenu"
        />
      </div>
      <!-- content -->
      <div class="iframe-container">
        <div v-if="loading">
          <loader />
        </div>
        <iframe
          :src="`${experience.url}`"
          name="disable-x-frame-options"
          referrerpolicy="unsafe-url"
          csp="default-src *; style-src 'unsafe-inline' *; script-src 'unsafe-inline' *"
          width="100%"
          height="100%"
          :frameborder="0"
          allowfullscreen
          @load="onObjLoad()"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import MenuBar from "@/components/Menu/MenuBar.vue"
  import MainMenu from "@/components/Menu/MainMenu.vue"
  import Settings from "@/store/Modules/Settings"
  import { nanoid } from "nanoid"
  import Loader from "./loader.vue"
  const settingsModule = getModule(Settings)
  export default {
    name: "IframeComponent",
    components: { MenuBar, MainMenu, Loader },
    data() {
      return {
        showMainOverlayMenu: false,
        mainMenuVisible: true,
        experience: {},
        loading: true,
      }
    },
    mounted() {
      this.experience = settingsModule.getExperience(this.$route.params.id)
    },
    methods: {
      //Onload object tag
      onObjLoad() {
        this.loading = false
      },
      toggleMainMenu() {
        this.mainMenuVisible = !this.mainMenuVisible
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import "./style.scss";
</style>
