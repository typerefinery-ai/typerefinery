<template>
  <div class="content-area">
    <div class="tabs-wrapper">
      <TabView
        class="tab-view-wrapper"
        :class="{ draggable: focus }"
        :active-index="activeIndex"
        @tab-click="onTabClick($event)"
      >
        <TabPanel v-for="(tab, i) in allTabs" :key="tab.id">
          <template #header>
            <div class="tab-item" :class="{ active: activeIndex === i }">
              <span :id="tab.id">{{ tab.label }}</span>
              <i class="pi pi-times" @click.stop="closeSplitView(tab)"></i>
            </div>
          </template>

          <!-- tab 1 -->
          <content-tab
            :pane-id="paneId"
            :focus="focus"
            :tools-visible="contentToolsVisible"
            :tab="tab"
            @toggle="toggleContentTools"
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
  </div>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import TabView from "primevue/tabview"
  import TabPanel from "primevue/tabpanel"
  import MenuBar from "@/components/Menu/MenuBar.vue"
  import ContentTab from "../ContentTab"
  import Settings from "@/store/Modules/Settings"
  import Projects from "@/store/Modules/Projects"
  import Connections from "@/store/Modules/Connections"
  import AppData from "@/store/Modules/AppData"
  import Themes from "@/store/Modules/Theme"
  const settingsModule = getModule(Settings)
  const projectsModule = getModule(Projects)
  const connectionsModule = getModule(Connections)
  const appDataModule = getModule(AppData)
  const themesModule = getModule(Themes)

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
      }
    },

    computed: {
      allTabs() {
        return this.tabs.map((el) => ({
          ...el,
          label:
            el.type === "query"
              ? projectsModule.getQueries(el.projectIdx)[el.queryIdx].label
              : el.type === "project"
              ? projectsModule.getProjectLabel(el.id)
              : el.type === "theme"
              ? el.parent
                ? projectsModule.getProjects[el.parentIdx].themes.list[
                    el.key.split("-").pop()
                  ].label
                : themesModule.data.list[el.key.split("-").pop()].label
              : el.type === "connection"
              ? el.parent
                ? projectsModule.getProjects[el.parentIdx].connections.list[
                    el.key.split("-").pop()
                  ].label
                : connectionsModule.data.list[el.key.split("-").pop()].label
              : el.label,
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

      closeSplitView(tab) {
        // if (this.paneId == "pane2") {
        //   return this.$emit("close-split-view")
        // }
        if (tab.type == "output") {
          appDataModule.removeSelectedSplitNodes(tab.id)
          appDataModule.toggleSplitNode()
        } else {
          appDataModule.removeSelectedTreeNodes(tab.id)
          appDataModule.toggleTreeNode()
        }
        projectsModule.updateSelectedNode({ key: tab.key })
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
            height: calc(100% - 39px);
            padding: 0;
          }

          .p-tabview-panel {
            height: 100%;
          }
        }
      }
    }
  }
</style>
