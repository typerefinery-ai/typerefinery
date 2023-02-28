<template>
  <div v-if="loading">
    <loader />
  </div>
  <div class="app">
    <div class="header" :class="{ 'menu-hidden': !mainMenuVisible }">
      <main-menu :main-menu-visible="mainMenuVisible" @toggle="toggleMainMenu" :subMenuVisible="false" />
      <menu-bar :menu-bar-visible="mainMenuVisible" @toggle="toggleMainMenu" />
    </div>
    <!-- content -->
    <div class="iframe-container">
      <object :data="`${Experience.url}`" width="100%" height="100%" @load="onObjLoad()"></object>
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
      Experience: {},
      loading: true
    }
  },
  mounted() {
    this.Experience = settingsModule.getExperience(this.$route.params.id)   
  },
  methods: {
    //Onload object tag
    onObjLoad(){
      this.loading=false
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
