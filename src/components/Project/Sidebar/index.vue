<template>
  <div class="sidebar-container">
    <div class="sidebar-fixed">
      <div class="sidebar-fixed-items text-primary">
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
        <logout-icon
          v-tooltip="$t(`tooltips.logout`)"
          :size="25"
          @click="logout"
        />
      </div>
    </div>
    <div id="sidebar-draggable" class="sidebar-draggable">
      <Tree
        class="h-full tree-wrapper"
        :meta-key-selection="false"
        :value="nodesData"
        :filter="true"
        filter-mode="lenient"
        :expanded-keys="expandedKeys"
        scroll-height="75vh"
        selection-mode="multiple"
        @node-select="onNodeSelect"
        @node-unselect="onNodeUnselect"
        @dblclick="handleNodeSelection"
      />
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
  import Transformers from "@/store/Modules/Transformers"
  import Algorithms from "@/store/Modules/Algorithms"
  import AppData from "@/store/Modules/AppData"
  const settingsModule = getModule(Settings)
  const projectsModule = getModule(Projects)
  const connectionsModule = getModule(Connections)
  const transformersModule = getModule(Transformers)
  const algorithmsModule = getModule(Algorithms)
  const appDataModule = getModule(AppData)

  export default {
    name: "Sidebar",
    components: { LogoutIcon, FileIcon, Tree, TuneIcon },
    data() {
      return {
        selectedNode: null,
        expandedKeys: {},
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
                label: "Queries",
                icon: "pi pi-fw pi-database",
                children: project.queries.list.map((query, qIdx) => {
                  return {
                    key: `0-${projectIdx}-0-${qIdx}`,
                    id: query.id,
                    type: query.type,
                    label: query.label,
                    icon: "pi pi-fw pi-file",
                    connection: query.connection,
                    parent: project.id,
                  }
                }),
              },
              {
                key: `0-${projectIdx}-1`,
                label: "Connections",
                icon: "pi pi-fw pi-server",
                children: project.connections.list.map((connection, cIdx) => {
                  return {
                    key: `0-${projectIdx}-1-${cIdx}`,
                    id: connection.id,
                    type: connection.type,
                    label: connection.label,
                    icon: "pi pi-fw pi-file",
                    parent: project.id,
                  }
                }),
              },
              {
                key: `0-${projectIdx}-2`,
                label: "Transformers",

                icon: "pi pi-fw pi-cog",
                children: project.transformers.list.map((transformer, tIdx) => {
                  return {
                    key: `0-${projectIdx}-2-${tIdx}`,
                    id: transformer.id,
                    type: transformer.type,
                    label: transformer.label,
                    icon: "pi pi-fw pi-file",
                    parent: project.id,
                  }
                }),
              },
              {
                key: `0-${projectIdx}-3`,
                label: "Algorithms",
                icon: "pi pi-fw pi-cog",
                children: project.algorithms.list.map((algorithm, aIdx) => {
                  return {
                    key: `0-${projectIdx}-3-${aIdx}`,
                    id: algorithm.id,
                    type: algorithm.type,
                    label: algorithm.label,
                    icon: "pi pi-fw pi-file",
                    parent: project.id,
                  }
                }),
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
        const transformers = {
          key: 2,
          type: "transformers",
          label: "Transformers",
          icon: "pi pi-fw pi-book",
          children: transformersModule.data.list.map((transformer, idx) => ({
            key: `2-${idx}`,
            id: transformer.id,
            type: transformer.type,
            label: transformer.label,
            icon: "pi pi-fw pi-file",
          })),
        }
        const algorithms = {
          key: 3,
          type: "algorithms",
          label: "Algorithms",
          icon: "pi pi-fw pi-book",
          children: algorithmsModule.data.list.map((algorithm, idx) => ({
            key: `3-${idx}`,
            id: algorithm.id,
            type: algorithm.type,
            label: algorithm.label,
            icon: "pi pi-fw pi-file",
          })),
        }
        return [projects, connections, transformers, algorithms]
      },
    },
    methods: {
      openSettings() {
        settingsModule.openSettingsDialog("general")
      },
      logout() {
        localStorage.clear()
        this.$router.push({ name: "Login" })
      },
      handleNodes(data) {
        let path
        switch (data.type) {
          case "query":
            this.openTab(data)
            return
          case "connection":
            if (data.parent) {
              path = `${data.parent}/${data.id}`
              appDataModule.toggleConnectionDialog()
              appDataModule.setTreeNodePath(path)
              return
            } else {
              path = `${data.id}`
              appDataModule.toggleConnectionDialog()
              appDataModule.setTreeNodePath(path)
              return
            }
          case "transformer":
            if (data.parent) {
              path = `${data.parent}/${data.id}`
              appDataModule.toggleTransformerDialog()
              appDataModule.setTreeNodePath(path)
            } else {
              path = `${data.id}`
              appDataModule.toggleTransformerDialog()
              appDataModule.setTreeNodePath(path)
            }
            return
          case "algorithm":
            if (data.parent) {
              path = `${data.parent}/${data.id}`
              appDataModule.toggleAlgorithmDialog()
              appDataModule.setTreeNodePath(path)
            } else {
              path = `${data.id}`
              appDataModule.toggleAlgorithmDialog()
              appDataModule.setTreeNodePath(path)
            }
            return
        }
      },
      openTab(data) {
        const { id, parent } = data
        const projectIdx = projectsModule.getProjects.findIndex(
          (el) => el.id == parent
        )
        const queryIdx = projectsModule
          .getQueries(projectIdx)
          .findIndex((el) => el.id == id)
        const queryData = { id, projectIdx, queryIdx }
        const isNew = !appDataModule.data.selectedTreeNodes.list.includes(id)
        if (isNew) {
          appDataModule.toggleTreeNode()
          appDataModule.setSelectedTreeNodes(queryData)
        }
      },
      onNodeSelect(node) {
        this.selectedNode = node
      },
      onNodeUnselect() {
        this.selectedNode = null
      },
      handleNodeSelection(e) {
        const node = e.target.getAttribute("role")
        const parent = e.target.parentElement.getAttribute("role")
        const isTreeNode = node == "treeitem" || parent == "treeitem"
        if (isTreeNode && !this.selectedNode.children) {
          this.handleNodes(this.selectedNode)
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import "./Sidebar.scss";
</style>
