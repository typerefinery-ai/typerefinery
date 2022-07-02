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
        :value="nodesData"
        :filter="true"
        filter-mode="lenient"
        :expanded-keys="expandedKeys"
        scroll-height="75vh"
      >
        <template #default="slotProps">
          <div @dblclick="selectNode(slotProps.node)">
            {{ slotProps.node.label }}
          </div>
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
  import AppSettings from "@/store/Modules/AppSettings"
  const appSettings = getModule(AppSettings)
  const appData = getModule(Projects)

  export default {
    name: "Sidebar",
    components: { LogoutIcon, FileIcon, Tree, TuneIcon },
    data() {
      return {
        expandedKeys: {},
      }
    },
    computed: {
      nodesData() {
        const nodes = appData.list.map((data, dataIdx) => {
          return {
            key: dataIdx,
            type: data.type,
            label: data.label,
            icon: "pi pi-fw pi-book",
            children: data.list.map((item, itemIdx) => ({
              key: `${dataIdx}-${itemIdx}`,
              id: item.id,
              type: item.type,
              label: item.label,
              icon: "pi pi-fw pi-file",
              children:
                item.type == "project"
                  ? [
                      {
                        key: `${dataIdx}-${itemIdx}-0`,
                        label: "Queries",
                        icon: "pi pi-fw pi-database",
                        children: item.queries.list.map((query, qIdx) => {
                          return {
                            key: `${dataIdx}-${itemIdx}-0-${qIdx}`,
                            id: query.id,
                            type: query.type,
                            label: query.label,
                            icon: "pi pi-fw pi-file",
                            connection: query.connection,
                            parent: item.id,
                          }
                        }),
                      },
                      {
                        key: `${dataIdx}-${itemIdx}-1`,
                        label: "Connections",
                        icon: "pi pi-fw pi-server",
                        children: item.connections.list.map(
                          (connection, cIdx) => {
                            return {
                              key: `${dataIdx}-${itemIdx}-1-${cIdx}`,
                              id: connection.id,
                              type: connection.type,
                              label: connection.label,
                              icon: "pi pi-fw pi-file",
                              parent: item.id,
                            }
                          }
                        ),
                      },
                      {
                        key: `${dataIdx}-${itemIdx}-2`,
                        label: "Transformers",

                        icon: "pi pi-fw pi-cog",
                        children: item.transformers.list.map(
                          (transformer, tIdx) => {
                            return {
                              key: `${dataIdx}-${itemIdx}-2-${tIdx}`,
                              id: transformer.id,
                              type: transformer.type,
                              label: transformer.label,
                              icon: "pi pi-fw pi-file",
                              parent: item.id,
                            }
                          }
                        ),
                      },
                      {
                        key: `${dataIdx}-${itemIdx}-3`,
                        label: "Algorithms",
                        icon: "pi pi-fw pi-cog",
                        children: item.algorithms.list.map(
                          (algorithm, aIdx) => {
                            return {
                              key: `${dataIdx}-${itemIdx}-3-${aIdx}`,
                              id: algorithm.id,
                              type: algorithm.type,
                              label: algorithm.label,
                              icon: "pi pi-fw pi-file",
                              parent: item.id,
                            }
                          }
                        ),
                      },
                    ]
                  : [],
            })),
          }
        })

        return nodes
      },
    },
    methods: {
      openSettings() {
        appSettings.openSettingsDialog("general")
      },
      logout() {
        localStorage.clear()
        this.$router.push({ name: "Login" })
      },
      selectNode(data) {
        let path
        switch (data.type) {
          case "query":
            this.openTab(data)
            return
          case "connection":
            if (data.parent) {
              path = `${data.parent}/${data.id}`
              appData.toggleConnectionDialog()
              appData.setTreeNodePath(path)
              return
            } else {
              path = `${data.id}`
              appData.toggleConnectionDialog()
              appData.setTreeNodePath(path)
              return
            }
          case "transformer":
            if (data.parent) {
              path = `${data.parent}/${data.id}`
              appData.toggleTransformerDialog()
              appData.setTreeNodePath(path)
            } else {
              path = `${data.id}`
              appData.toggleTransformerDialog()
              appData.setTreeNodePath(path)
            }
            return
          case "algorithm":
            if (data.parent) {
              path = `${data.parent}/${data.id}`
              appData.toggleAlgorithmDialog()
              appData.setTreeNodePath(path)
            } else {
              path = `${data.id}`
              appData.toggleAlgorithmDialog()
              appData.setTreeNodePath(path)
            }
            return
        }
      },
      openTab(data) {
        const { id, parent } = data
        const projectIdx = appData.list[0].list.findIndex(
          (el) => el.id == parent
        )
        const queryIdx = appData.list[0].list[
          projectIdx
        ].queries.list.findIndex((el) => el.id == id)
        const queryData = { id, projectIdx, queryIdx }
        const isNew = !appData.selectedTreeNodes.list.includes(id)
        if (isNew) {
          appData.toggleTreeNode()
          appData.setSelectedTreeNodes(queryData)
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import "./Sidebar.scss";
</style>
