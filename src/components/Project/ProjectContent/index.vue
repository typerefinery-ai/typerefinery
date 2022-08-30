<template>
  <div class="app-main">
    <splitpanes
      :dbl-click-splitter="false"
      :push-other-panes="false"
      @splitter-click="handleSplitterClick"
    >
      <pane
        v-if="!focus"
        ref="sidebarPane"
        class="sidebar-pane"
        :size="pane1Size"
        max-size="35"
      >
        <sidebar />
      </pane>
      <pane
        v-for="pane in panes"
        :key="pane.id"
        class="content-pane"
        :size="panesSize"
        min-size="30"
      >
        <content-view
          :tabs="pane.tabs"
          :pane-id="pane.id"
          :panes="panes"
          :focus="focus"
          @split-view="splitView"
          @close-split-view="closeSplitView"
        />
      </pane>
    </splitpanes>
  </div>
</template>

<script>
  import { Splitpanes, Pane } from "splitpanes"
  import { getModule } from "vuex-module-decorators"
  import Sidebar from "../Sidebar"
  import ContentView from "./ContentView.vue"
  import AppData from "@/store/Modules/AppData"
  const appDataModule = getModule(AppData)

  export default {
    name: "ProjectContent",
    components: {
      Sidebar,
      Splitpanes,
      Pane,
      ContentView,
    },
    props: {
      focus: {
        type: Boolean,
        required: true,
      },
    },
    data() {
      return {
        pane1Size: 25,
        panesSize: 75,
        panes: [
          {
            id: "pane1",
            tabs: [],
          },
        ],
        activeTabIndex: 0,
      }
    },
    computed: {
      nodeSelected() {
        return appDataModule.data.treeNodeClicked
      },
      splitNodeSelected() {
        return appDataModule.data.splitNodeClicked
      },
    },
    watch: {
      nodeSelected() {
        this.updateTabs()
      },
      splitNodeSelected() {
        this.updateSplitTabs()
      },
    },
    mounted() {
      this.updateTabs()
      this.updateSplitTabs()
    },

    methods: {
      splitView(idx) {
        const tab = this.panes[0].tabs[idx]
        const pane = { id: "pane2", tabs: [tab] }
        if (this.panes.length === 1) {
          this.panes.push(pane)
          setTimeout(() => {
            this.pane1Size = 0
            this.panesSize = 45
          }, 0)
        } else {
          this.panes[1] = pane
        }
      },
      closeSplitView() {
        this.panes.pop()
      },
      handleSplitterClick(e) {
        if (e.index !== 1) return
        const pane = this.$refs.sidebarPane
        pane.style.width == "0"
          ? (pane.style.width = "25%")
          : (pane.style.width = 0)
      },
      updateTabs() {
        const projectsArray = appDataModule.data.selectedTreeNodes || {
          list: [],
        }
        const existingTabs = [...this.panes[0].tabs]
        const newTabs = []
        projectsArray.list.forEach((el) => {
          const tab = { ...projectsArray[el] }
          if (!existingTabs.includes(tab)) {
            newTabs.push(tab)
          }
        })
        this.panes[0].tabs = newTabs
      },
      updateSplitTabs() {
        const nodes = appDataModule.data.selectedSplitNodes
        if (nodes.list.length) {
          const allTabs = []
          nodes.list.forEach((el) => {
            allTabs.push(nodes[el])
          })
          const pane = { id: "pane2", tabs: allTabs }
          if (this.panes.length === 1) {
            this.panes.push(pane)
            setTimeout(() => {
              this.pane1Size = 0
              this.panesSize = 45
            }, 0)
          } else {
            this.panes[1] = pane
          }
        } else if (this.panes.length > 1) {
          this.panes = this.panes.filter((el) => el.id !== "pane2")
        }
        // const splitTabs = appDataModule.data.selectedTreeNodes || {
        //   split_list: [],
        // }
        // const newTabs = []
        // const existingTabs =
        //   this.panes.length > 1 ? [...this.panes[1].tabs] : []
        // splitTabs.split_list.forEach((el) => {
        //   const tab = { ...splitTabs[el] }
        //   if (!existingTabs.includes(tab)) {
        //     newTabs.push(tab)
        //   }
        // })
        // const pane = { id: "pane2", tabs: newTabs }
        // if (this.panes.length === 1) {
        //   this.panes.push(pane)
        //   setTimeout(() => {
        //     this.pane1Size = 0
        //     this.panesSize = 45
        //   }, 0)
        // } else {
        //   this.panes[1] = pane
        // }
      },
    },
  }
</script>

<style lang="scss">
  @import "./ProjectContent.scss";
</style>
