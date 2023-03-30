<template>
  <div class="content-area">
    <div class="tabs-wrapper">
      <TabView
        :scrollable="true"
        class="tab-view-wrapper"
        :class="{ draggable: focus }"
        :active-index="activeIndex"
        @tab-click="onTabClick($event)"
      >
        <TabPanel v-for="(tab, i) in allTabs" :key="tab.id">
          <template #header>
            <div class="tab-item" :class="{ active: activeIndex === i }">
              <span :id="tab.id">{{ tab.label }}</span>
              <i
                v-if="dirtyTabs[tab.id]"
                class="pi pi-circle-fill mini-circle"
              ></i>
              <i class="pi pi-times" @click.stop="handleClosePrompt(tab)"></i>
            </div>
          </template>
          <!-- tab 1 -->
          <content-tab
            :pane-id="paneId"
            :focus="focus"
            :tools-visible="contentToolsVisible"
            :tab="tab"
            :dirty-tabs="dirtyTabs"
            @toggle="toggleContentTools"
            @input="handleFormState"
            @check-tab-if-dirty="checkTabIfDirty"
          />
        </TabPanel>
      </TabView>
      <div
        v-show="!contentToolsVisible && !focus"
        v-tooltip="$t(`tooltips.show-content-tools`)"
        class="icon-wrapper-down hover:text-primary"
        @click="toggleContentTools"
      >
        <i class="pi pi-angle-double-down"></i>
      </div>
      <menu-bar
        v-if="focus && paneId === panes[panes.length - 1].id"
        :menu-bar-visible="contentToolsVisible"
        @toggle="toggleContentTools"
      />
    </div>
    <close-prompt
      :show-dialog="showDialog"
      @close="showDialog = false"
      @confirm="handleConfirm"
    />
  </div>
</template>
<script>
  import { getModule } from "vuex-module-decorators"
  import TabView from "primevue/tabview"
  import TabPanel from "primevue/tabpanel"
  import MenuBar from "@/components/Menu/MenuBar.vue"
  import ContentTab from "../ContentTab"
  import ClosePrompt from "./ClosePrompt.vue"
  import Settings from "@/store/Modules/Settings"
  import Projects from "@/store/Modules/Projects"
  import Connections from "@/store/Modules/Connections"
  import AppData from "@/store/Modules/AppData"
  import Themes from "@/store/Modules/Theme"
  import Queries from "@/store/Modules/Queries"
  const settingsModule = getModule(Settings)
  const projectsModule = getModule(Projects)
  const connectionsModule = getModule(Connections)
  const appDataModule = getModule(AppData)
  const themesModule = getModule(Themes)
  const queriesModule = getModule(Queries)
  TabView.methods.onTabClick = function (event, i) {
    this.$emit("tab-click", {
      originalEvent: event,
      index: i,
    })
  }
  export default {
    name: "ContentView",
    components: {
      ContentTab,
      MenuBar,
      TabView,
      TabPanel,
      ClosePrompt,
    },
    props: {
      focus: { type: Boolean, required: true },
      tabs: { type: Array, required: true },
      paneId: { type: String, required: true },
      panes: { type: Array, required: true },
    },
    emits: ["split-view", "close-split-view"],
    data() {
      return {
        contentToolsVisible: true,
        activeIndex: 0,
        dirtyTabs: {},
        showDialog: false,
        dialogTab: {},
      }
    },
    computed: {
      allTabs() {
        return this.tabs.map((el) => ({
          ...el,
          label: this.getLabel(el),
        }))
      },
      activeNode() {
        return this.paneId === "pane1"
          ? appDataModule.data.selectedTreeNodes.activeNode
          : appDataModule.data.selectedSplitNodes.activeNode
      },
    },
    watch: {
      focus(isTrue) {
        if (isTrue) this.contentToolsVisible = false
        else this.contentToolsVisible = true
      },
      tabs(newVal, oldVal) {
        // to fix a bug
        if (newVal.length - oldVal.length > 1) return
        // actual logic
        const index = newVal.findIndex((el) => el.id == this.activeNode)
        if (index === -1) this.activeIndex = 0
        else this.activeIndex = index
      },
      activeNode(newVal) {
        const index = this.allTabs.findIndex((el) => el.id == newVal)
        if ((this.activeIndex !== index) & (index !== -1))
          this.activeIndex = index
      },
    },
    methods: {
      getLabel(tab) {
        const projects = projectsModule.getProjects
        const projectIdx = projects.findIndex((el) => el.id === tab.parent)
        if (tab.type === "query" && tab.parent) {
          const queries = projectsModule.getQueries(projectIdx)
          const queryIdx = queries.findIndex((el) => el.id === tab.id)
          return projectsModule.getQueries(projectIdx)[queryIdx].label
        } else if (tab.type === "query") {
          const queries = queriesModule.getGlobalQueries
          const queryIdx = queries.findIndex((el) => el.id === tab.id)
          return queriesModule.getGlobalQueries[queryIdx].label
        } else if (tab.type === "connection" && tab.parent) {
          const connections = projectsModule.getLocalConnections(projectIdx)
          const connectionIdx = connections.findIndex((el) => el.id === tab.id)
          return projectsModule.getLocalConnections(projectIdx)[connectionIdx]
            .label
        } else if (tab.type === "connection") {
          const connections = connectionsModule.getGlobalConnections
          const connectionIdx = connections.findIndex((el) => el.id === tab.id)
          return connectionsModule.getGlobalConnections[connectionIdx].label
        } else if (tab.type === "project") {
          const projectIdx = projects.findIndex((el) => el.id === tab.id)
          return projects[projectIdx].label
        } else if (tab.type === "theme" && tab.parent) {
          const themes = projectsModule.getLocalThemes(projectIdx)
          const themeIdx = themes.findIndex((el) => el.id === tab.id)
          return projectsModule.getLocalThemes(projectIdx)[themeIdx].label
        } else if (tab.type === "theme") {
          const themes = themesModule.getGlobalThemes
          const themeIdx = themes.findIndex((el) => el.id === tab.id)
          return themesModule.getGlobalThemes[themeIdx].label
        } else {
          return tab.label
        }
      },
      onTabClick(e) {
        const id = e.originalEvent.target.id
        if (!id) return
        if (this.paneId === "pane1") {
          appDataModule.setActiveTreeNode(id)
        } else {
          appDataModule.setActiveSplitNode(id)
        }
        this.activeIndex = e.index
        // const ctrl = e.originalEvent?.ctrlKey
        // if (ctrl) {
        //   this.splitView(e.index)
        // } else {
        //   this.activeIndex = e.index
        // }
      },
      toggleContentTools() {
        this.contentToolsVisible = !this.contentToolsVisible
        settingsModule.resizeView()
      },
      splitView(idx) {
        this.$emit("split-view", idx)
      },
      handleClosePrompt(tab) {
        if (this.dirtyTabs[tab.id]) {
          this.showDialog = true
          this.dialogTab = tab
        } else {
          this.closeTab(tab)
        }
      },
      checkTabIfDirty(tabId) {
        return true
      },
      handleConfirm() {
        this.closeTab(this.dialogTab)
        this.handleFormState({ id: this.dialogTab.id, isDirty: false })
        this.showDialog = false
      },
      closeTab(tab) {
        if (!tab.id) return
        if (tab.type == "output") {
          appDataModule.removeSelectedSplitNodes(tab.id)
          appDataModule.toggleSplitNode()
        } else {
          appDataModule.removeSelectedTreeNodes([tab.id])
          appDataModule.toggleTreeNode()
        }
        projectsModule.updateSelectedNode({ key: tab.key })
      },
      handleFormState({ id, isDirty }) {
        if (this.dirtyTabs[id] && !isDirty) {
          delete this.dirtyTabs[id]
        } else if (!this.dirtyTabs[id] && isDirty) {
          this.dirtyTabs[id] = true
        }
      },
    },
  }
</script>
<style lang="scss">
  #body {
    .content-area {
      .tabs-wrapper {
        position: relative;
        height: 100%;
        .tab-item {
          display: flex;
          align-items: center;
          .pi-times {
            margin-left: 10px;
            font-size: 90%;
            position: relative;
            top: 1px;
          }
        }
        .icon-wrapper-down {
          position: absolute;
          top: 12px;
          right: 10px;
          cursor: pointer;
        }
        .tab-view-wrapper {
          height: 100%;
        }
        .p-tabview {
          .p-tabview-panels {
            height: 92vh;
            padding: 0;
            overflow: auto;
          }
          .p-tabview-panel {
            height: 92%;
            overflow: auto;
          }
        }
      }
      .mini-circle {
        font-size: 0.8rem;
        margin-left: 0.5rem;
        top: 1px;
        position: relative;
      }
    }
  }
</style>
