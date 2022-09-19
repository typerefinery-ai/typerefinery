<template>
  <div class="sidebar-container">
    <div class="sidebar-fixed">
      <div class="sidebar-fixed-items text-primary" @click="toggleSidebar">
        <file-icon v-tooltip="$t(`tooltips.project`)" :size="20" />
      </div>
      <!-- SEARCH ICON -->
      <!-- <div class="sidebar-fixed-items hover:text-primary">
        <magnify-icon v-tooltip="$t(`tooltips.search`)" :size="20" />
      </div> -->
      <div class="sidebar-fixed-items hover:text-primary" @click="openSettings">
        <tune-icon v-tooltip="$t(`tooltips.settings`)" :size="25" />
      </div>
      <div class="sidebar-fixed-items hover:text-primary">
        <logout-icon v-tooltip="$t(`tooltips.logout`)" :size="25" />
      </div>
    </div>
    <div id="sidebar-draggable" class="sidebar-draggable">
      <Tree
        class="h-full tree-wrapper"
        :value="nodesData"
        :filter="true"
        filter-mode="lenient"
        :expanded-keys="expandedKeys"
        selection-mode="single"
        :selection-keys="selectionKeys"
        scroll-height="75vh"
        @node-expand="expandNode"
        @node-collapse="collapseNode"
        @node-select="onNodeSelect"
        @node-unselect="onNodeUnselect"
        @dblclick="handleNodeSelection"
      >
        <template #default="slotProps">
          <span v-if="isSelected(slotProps.node.id)" class="label_wrapper">
            <b class="selected-node" role="treeitem"
              >{{ slotProps.node.label }}
            </b>
            <i id="label_icon" class="pi pi-circle-fill"></i>
          </span>
          <span v-else role="treeitem">{{ slotProps.node.label }}</span>
        </template>
      </Tree>
    </div>
  </div>
</template>

<script>
  import Tree from "primevue/tree"
  import FileIcon from "vue-material-design-icons/FileMultipleOutline.vue"
  //   import MagnifyIcon from "vue-material-design-icons/Magnify.vue"
  import LogoutIcon from "vue-material-design-icons/Logout.vue"
  import TuneIcon from "vue-material-design-icons/Tune.vue"
  import { getModule } from "vuex-module-decorators"
  import Projects from "@/store/Modules/Projects"
  import Settings from "@/store/Modules/Settings"
  import Connections from "@/store/Modules/Connections"
  import FlowMessage from "@/store/Modules/FlowMessage"
  // import Transformers from "@/store/Modules/Transformers"
  // import Algorithms from "@/store/Modules/Algorithms"
  import AppData from "@/store/Modules/AppData"
  const settingsModule = getModule(Settings)
  const projectsModule = getModule(Projects)
  const connectionsModule = getModule(Connections)
  const flowMessageModule = getModule(FlowMessage)
  // const transformersModule = getModule(Transformers)
  // const algorithmsModule = getModule(Algorithms)
  const appDataModule = getModule(AppData)

  export default {
    name: "Sidebar",
    components: { LogoutIcon, FileIcon, Tree, TuneIcon },
    data() {
      return {
        selectedNode: null,
        connection: null,
        displayHome: false,
      }
    },
    computed: {
      nodesData() {
        const projects = {
          key: 0,
          type: "projects",
          label: "Projects",
          icon: "pi pi-fw pi-book",
          children: projectsModule.data.list.map((project, projectIdx) => ({
            key: `0-${projectIdx}`,
            id: project.id,
            type: project.type,
            label: project.label,
            icon: "pi pi-fw pi-file",
            children: [
              {
                key: `0-${projectIdx}-0`,
                label: "Connections",
                type: "connections",
                parentIdx: projectIdx,
                icon: "pi pi-fw pi-server",
                children: project.connections.list.map((connection, cIdx) => {
                  return {
                    key: `0-${projectIdx}-0-${cIdx}`,
                    id: connection.id,
                    type: connection.type,
                    label: connection.label,
                    icon: "pi pi-fw pi-file",
                    parent: project.id,
                    parentIdx: projectIdx,
                  }
                }),
              },
              {
                key: `0-${projectIdx}-1`,
                label: "Queries",
                type: "queries",
                parentIdx: projectIdx,
                icon: "pi pi-fw pi-database",
                children: project.queries.list.map((query, qIdx) => {
                  return {
                    key: `0-${projectIdx}-1-${qIdx}`,
                    id: query.id,
                    type: query.type,
                    label: query.label,
                    icon: "pi pi-fw pi-file",
                    connection: query.connection,
                    parent: project.id,
                    parentIdx: projectIdx,
                  }
                }),
              },
              {
                key: `0-${projectIdx}-2`,
                label: "Themes",
                type: "themes",
                parentIdx: projectIdx,
                icon: "pi pi-fw pi-server",
                children: project.themes.list.map((theme, tIdx) => {
                  return {
                    key: `0-${projectIdx}-2-${tIdx}`,
                    id: theme.id,
                    type: theme.type,
                    label: theme.label,
                    icon: "pi pi-fw pi-file",
                    parent: project.id,
                    parentIdx: projectIdx,
                  }
                }),
              },
              {
                key: `0-${projectIdx}-3`,
                label: "Wirings",
                type: "wirings",
                parentIdx: projectIdx,
                icon: "pi pi-fw pi-server",
                children: [
                  ...project.wirings.list.map((wiring) => {
                    return {
                      key: `0-${projectIdx}-3-0`,
                      id: wiring.id,
                      type: wiring.type,
                      label: wiring.label,
                      icon: "pi pi-fw pi-file",
                      parent: project.id,
                      parentIdx: projectIdx,
                    }
                  }),
                  {
                    key: `0-${projectIdx}-3-1`,
                    label: "Outputs",
                    type: "outputs",
                    parentIdx: projectIdx,
                    icon: "pi pi-fw pi-server",
                    children: Object.keys(flowMessageModule.data).map(
                      (objkey, oIdx) => {
                        return {
                          key: `0-${projectIdx}-0-${projectIdx}-3-1-${oIdx}`,
                          id: objkey,
                          type: "output",
                          label: "Output_Viz " + ++oIdx,
                          icon: "pi pi-fw pi-file",
                          parent: project.id,
                          parentIdx: projectIdx,
                        }
                      }
                    ),
                  },
                ],
              },
            ],
          })),
        }
        const connections = {
          key: 1,
          type: "connections",
          label: "Connections",
          icon: "pi pi-fw pi-book",
          children: connectionsModule.data.list.map((connection, idx) => ({
            key: `1-${idx}`,
            id: connection.id,
            type: connection.type,
            label: connection.label,
            icon: "pi pi-fw pi-file",
          })),
        }
        return [projects, connections]
      },
      expandedKeys() {
        return projectsModule.data.expandedNodes
      },
      selectionKeys() {
        return projectsModule.data.selectedNode
      },
      activeNode() {
        return appDataModule.data.selectedTreeNodes.activeNode
      },
    },
    mounted() {
      const selectedNodes = appDataModule.data.selectedTreeNodes.list
      if (selectedNodes.length) {
        appDataModule.setActiveTreeNode(selectedNodes[0])
      }
    },
    methods: {
      isSelected(id) {
        if (
          this.activeNode === id &&
          appDataModule.data.selectedTreeNodes.list.includes(id)
        ) {
          return true
        }
        return false
      },
      openSettings() {
        settingsModule.openSettingsDialog("general")
      },

      handleNodes(data) {
        if (data.type === "query") {
          this.openQuery(data)
        } else {
          this.openTab(data)
        }
      },
      openQuery(data) {
        const { id, parent, type, key } = data
        const projectIdx = projectsModule.getProjects.findIndex(
          (el) => el.id == parent
        )
        const queryIdx = projectsModule
          .getQueries(projectIdx)
          .findIndex((el) => el.id == id)
        const queryData = { key, type, id, projectIdx, queryIdx, ...data }
        const isNew = !appDataModule.data.selectedTreeNodes.list.includes(id)
        if (isNew) {
          appDataModule.toggleTreeNode()
          appDataModule.setSelectedTreeNodes(queryData)
        } else {
          appDataModule.setActiveTreeNode(id)
        }
      },
      openTab(data) {
        const { id, type } = data
        if (type == "output") {
          // split the tab
          const isNew = !appDataModule.data.selectedSplitNodes.list.includes(id)
          if (isNew) {
            appDataModule.toggleSplitNode()
            appDataModule.setSelectedSplitNodes(data)
          }
          appDataModule.setActiveSplitNode(id)
        } else {
          // open tab
          const isNew = !appDataModule.data.selectedTreeNodes.list.includes(id)
          if (isNew) {
            appDataModule.toggleTreeNode()
            appDataModule.setSelectedTreeNodes(data)
          }
          appDataModule.setActiveTreeNode(id)
        }
      },
      onNodeSelect(node) {
        this.selectedNode = node
      },
      onNodeUnselect() {
        this.selectedNode = null
      },
      handleNodeSelection(e) {
        // const nodesInStore = projectsModule.data.selectedNode
        // if (Object.keys(nodesInStore).length) {
        //   projectsModule.updateSelectedNode({ key: null, value: null })
        // }
        const node = e.target.getAttribute("role")
        const parent = e.target.parentElement.getAttribute("role")
        const isTreeNode = node == "treeitem" || parent == "treeitem"
        const { key, children } = this.selectedNode
        if (isTreeNode && !children) {
          projectsModule.updateSelectedNode({ key, value: true })
          this.handleNodes(this.selectedNode)
        }
        if (isTreeNode && this.selectedNode.type == "project") {
          projectsModule.updateSelectedNode({ key, value: true })

          this.handleNodes(this.selectedNode)
        }
      },
      expandNode({ key }) {
        projectsModule.updateExpandedNodes({ key, value: true })
      },
      collapseNode({ key }) {
        projectsModule.updateExpandedNodes({ key, value: false })
      },
      toggleSidebar() {
        appDataModule.toggleSidebarPanel()
      },
    },
  }
</script>

<style lang="scss">
  @import "./Sidebar.scss";
</style>
