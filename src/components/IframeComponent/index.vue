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
          v-if="sandbox"
          :src="url"
          :name="name"
          :csp="csp"
          :referrerpolicy="referrerpolicy"
          :sandbox="sandbox"
          :sandbox2="iframeconfig.sandbox"
          :allow="allow"
          :allowpaymentrequest="allowpaymentrequest"
          width="100%"
          height="100%"
          :frameborder="0"
          :allowpopups="allowpopups"
          :allowfullscreen="allowfullscreen"
          @load="onObjLoad()"
        ></iframe>
        <iframe
          v-else
          :src="url"
          :name="name"
          width="100%"
          height="100%"
          nosandbox
          :frameborder="0"
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
  import Services from "@/store/Modules/Services"
  import { nanoid } from "nanoid"
  import Loader from "./loader.vue"
  const settingsModule = getModule(Settings)
  const servicesModule = getModule(Services)
  export default {
    name: "IframeComponent",
    components: { MenuBar, MainMenu, Loader },
    data() {
      return {
        showMainOverlayMenu: false,
        mainMenuVisible: true,
        experience: {},
        loading: true,
        globalenv: {},
        url: undefined,
        name: undefined,
        csp: undefined,
        referrerpolicy: undefined,
        sandbox: undefined,
        allow: undefined,
        allowpaymentrequest: undefined,
        allowpopups: undefined,
        allowfullscreen: undefined,
        iframeconfig: {
          name: undefined,
          csp: undefined,
          referrerpolicy: undefined,
          sandbox: undefined,
          allow: undefined,
          allowpaymentrequest: undefined,
          allowpopups: undefined,
          allowfullscreen: undefined,
        },
      }
    },
    mounted() {
      this.experience = settingsModule.getExperience(this.$route.params.id)
      this.url = this.experience.url
      this.urlformatted = this.experience.urlformatted
      let iframeconfig = this.experience.iframeconfig
        ? this.experience.iframeconfig
        : {
            name: undefined,
            csp: undefined,
            referrerpolicy: undefined,
            sandbox: undefined,
            allow: undefined,
            allowpaymentrequest: undefined,
            allowpopups: undefined,
            allowfullscreen: undefined,
          }
      this.referrerpolicy = iframeconfig.referrerpolicy
        ? iframeconfig.referrerpolicy
        : undefined
      this.csp = iframeconfig.csp ? iframeconfig.csp : undefined
      this.sandbox = iframeconfig.sandbox
      this.iframeconfig.sandbox = iframeconfig.sandbox
      if (!this.sandbox) {
        console.log("iframeconfig.sandbox", this.sandbox)
        delete this.iframeconfig.sandbox
      }
      this.allow = iframeconfig.allow ? iframeconfig.allow : undefined
      this.allowpaymentrequest = iframeconfig.allowpaymentrequest
        ? "true"
        : undefined
      this.allowpopups = iframeconfig.allowpopups ? "allowpopups" : undefined
      this.allowfullscreen = iframeconfig.allowfullscreen
        ? "allowfullscreen"
        : undefined
      this.name = iframeconfig.name ? iframeconfig.name : undefined

      // name="disable-x-frame-options"
      // referrerpolicy="strict-origin-when-cross-origin"
      // sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
      // allow="encrypted-media; fullscreen; oversized-images; picture-in-picture; sync-xhr; geolocation;"

      console.log("iframe this.url", this.url)
      console.log("iframe this.urlformatted", this.urlformatted)

      servicesModule.getGlobalEnv().then((res) => {
        this.globalenv = res
        let urlformatted = this.url
        console.log("iframe got getGlobalEnv", res)
        if (urlformatted.indexOf("${") > -1) {
          console.log("iframe getGlobalEnv exp value", this.globalenv)
          // update variables in url
          for (const [key, value] of Object.entries(this.globalenv)) {
            console.log(
              `experienceConfig find \${${key}} repalce with ${value}"`
            )

            urlformatted = urlformatted.replaceAll(`\${${key}}`, `${value}`)
          }

          console.log("iframe urlformatted updated", urlformatted)
          this.url = urlformatted
        }
        console.log("iframe this.url", this.url)
      })
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
