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
  </div>
</template>

<script>
  import ProjectContent from "./ProjectContent"
  import { getModule } from "vuex-module-decorators"
  import Projects from "@/store/Modules/Projects"
  import MainMenu from "@/components/Menu/MainMenu.vue"
  import MenuBar from "@/components/Menu/MenuBar.vue"
  import Settings from "@/store/Modules/Settings"
  const projectsModule = getModule(Projects)
  import AppData from "@/store/Modules/AppData"
  import axios from "@/axios"
  import * as websocket from "websocket"
  const settingsModule = getModule(Settings)
  const appDataModule = getModule(AppData)
  export default {
    name: "Project",
    components: { ProjectContent, MenuBar, MainMenu },

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
        client.onmessage = async (e) => {
          console.log(e)
          if (typeof e.data === "string") {
            const response = JSON.parse(e.data)

            if (response.type === "publish") {
              try {
                const { data: projects } = await axios.get("/datastore/project")
                const project = projects.find(
                  (el) => el.projectid === response.data.projectId
                )
                let payload = {
                  ...project,
                  flowoutputlist: JSON.stringify([response.data]),
                }
                // update the project with flowoutput
                await axios.put(
                  `/datastore/project/${response.data.projectId}`,
                  payload
                )
                payload.flowoutputlist = [response.data]
                projectsModule.updateProjectOutput(payload)
              } catch (err) {
                console.log(err)
              }
              // Open Output & update the tree
              const nodeId = `${response.data.stepId}.${response.data.projectId}`
              // Select Node in tree
              appDataModule.setSelectedSplitNodes({
                id: nodeId,
                type: "output",
                label: "Output_Viz",
                key: nodeId,
                parent: response.data.projectId,
                icon: "pi pi-fw pi-file",
              })
              // Expand Output (parent)
              projectsModule.updateExpandedNodes({
                key: `0-3-0-${response.data.projectId}`,
                value: true,
              })
              // Set selected state
              projectsModule.updateSelectedNode({
                key: nodeId,
                value: true,
              })
              // set active state
              appDataModule.setActiveSplitNode(nodeId)
              appDataModule.toggleSplitNode()
            }

            sendSubscribe()
          }
        }

        function sendSubscribe() {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(subscribe_insert))
          }
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import "./style.scss";
</style>
