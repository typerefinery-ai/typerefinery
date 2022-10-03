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
    <project-content :focus="focusMode" />

    <sample-data-popup v-if="samplePopupOpen" />
  </div>
</template>

<script>
  import ProjectContent from "./ProjectContent"
  import { getModule } from "vuex-module-decorators"
  import Projects from "@/store/Modules/Projects"
  import MainMenu from "@/components/Menu/MainMenu.vue"
  import MenuBar from "@/components/Menu/MenuBar.vue"
  import Settings from "@/store/Modules/Settings"
  import sampleDataPopup from "@/components/Dialog/sampleDataPopup.vue"
  import FlowMessage from "@/store/Modules/FlowMessage"
  const projectsModule = getModule(Projects)
  import AppData from "@/store/Modules/AppData"
  import * as websocket from "websocket"
  const settingsModule = getModule(Settings)
  const flowModule = getModule(FlowMessage)
  const appDataModule = getModule(AppData)
  export default {
    name: "Project",
    components: { ProjectContent, MenuBar, MainMenu, sampleDataPopup },

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
      samplePopupOpen() {
        return projectsModule.showSamplePopup
      },
    },
    mounted() {
      this.initTMS()
    },
    methods: {
      toggleMainMenu() {
        this.mainMenuVisible = !this.mainMenuVisible
      },
      initTMS() {
        const subscribe_insert = {
          type: "subscribers",
          subscribers: ["svg_insert"],
        }

        const W3CWebSocket = websocket.w3cwebsocket
        const client = new W3CWebSocket("ws://127.0.0.1:8112/$tms/")
        client.onopen = function () {
          console.log("WebSocket Client Connected")
          console.log(
            "readyState: " +
              (client.readyState === client.OPEN ? "OPEN" : "CLOSED")
          )
        }
        client.onclose = function () {
          console.log("WebSocket Client Closed")
        }
        client.onerror = function (error) {
          console.log("WebSocket Client Error: " + error)
        }
        client.onmessage = (e) => {
          console.log(e)
          if (typeof e.data === "string") {
            // console.log("Received: '" + e.data + "'")
            // console.log(JSON.parse(e.data))
            const response = JSON.parse(e.data)
            // console.log(response)
            // const data = this.context.state.data
            // if (data.dtcreated && response.type === "publish") {
            //   const d1 = new Date(this.context.state.data.dtcreated)
            //   const d2 = new Date(response.data.dtcreated)
            //   console.log({ d1: d1.getTime(), d2: d2.getTime() })
            //   if (d1.getTime() !== d2.getTime()) {
            //     console.log("setting state....!!!!!!!!!!!!")
            //     this.context.commit("setData", response.data)
            //   }
            // } else if (response.type === "publish") {
            //   console.log("setting state for the first time+++++++")
            //   this.context.commit("setData", response.data)
            // }

            if (response.type === "publish") {
              console.log(response)
              flowModule.setData(response.data)
              appDataModule.setSelectedSplitNodes({
                id: response.data.stepId,
                type: "output",
                label: "Output",
                key: response.data.stepId,
              })
              projectsModule.updateExpandedNodes({
                key: `0-3-0-${response.data.projectId}`,
                value: true,
              })
              projectsModule.updateSelectedNode({
                key: response.data.stepId,
                value: true,
              })
              appDataModule.setActiveSplitNode(response.data.stepId)
              appDataModule.toggleSplitNode()
              // this.context.commit("setData", response.data)
            }

            sendSubscribe()
          }
        }

        function sendSubscribe() {
          if (client.readyState === client.OPEN) {
            // console.log("sending subscribe")
            client.send(JSON.stringify(subscribe_insert))
            // console.log("sending subscribe done")
          }
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import "./style.scss";
</style>
