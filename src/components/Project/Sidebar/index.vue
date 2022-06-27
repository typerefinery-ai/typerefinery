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
      >
        <template #default="slotProps">
          <div @dblclick="selectNode(slotProps.node)">
            {{ slotProps.node.name }}
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
  const appProjects = getModule(Projects)

  export default {
    name: "Sidebar",
    components: { LogoutIcon, FileIcon, Tree, TuneIcon },
    data() {
      return {
        expandedKeys: {},
      }
    },
    computed: {
      storeList() {
        return appProjects.storedata
      },
      nodesData() {
        return this.storeList.map((el, i) => {
          return {
            key: i,
            id: el.id,
            name: el.name,
            data: "Project Folder",
            icon: "pi pi-fw pi-book",
            children: [
              {
                key: `${i}-0`,
                name: "Query",
                data: "Query Folder",
                icon: "pi pi-fw pi-database",
                children: el.queries.list.map((q, qIdx) => {
                  return {
                    key: `${i}-0-${qIdx}`,
                    id: q.id,
                    type: q.type,
                    name: q.name,
                    data: "Query Folder",
                    icon: "pi pi-fw pi-file",
                    connection: q.connection,
                    parent: el.name,
                  }
                }),
              },
              {
                key: `${i}-1`,
                name: "Connection",
                data: "Connection Folder",
                icon: "pi pi-fw pi-server",
                children: el.connections.list.map((c, cIdx) => {
                  return {
                    key: `${i}-1-${cIdx}`,
                    id: c.id,
                    type: c.type,
                    name: c.name,
                    data: "Connection Folder",
                    icon: "pi pi-fw pi-file",
                    parent: el.name,
                  }
                }),
              },
              {
                key: `${i}-2`,
                name: "Transformer",
                data: "Transformer Folder",
                icon: "pi pi-fw pi-cog",
                children: el.transformers.list.map((t, tIdx) => {
                  return {
                    key: `${i}-2-${tIdx}`,
                    id: t.id,
                    type: t.type,
                    name: t.name,
                    data: "Transformer Folder",
                    icon: "pi pi-fw pi-file",
                    parent: el.name,
                  }
                }),
              },
            ],
          }
        })
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
            path = `${data.parent}/${data.name}`
            appProjects.toggleConnectionDialog()
            appProjects.setEditNode(path)
            return
          case "transformer":
            path = `${data.parent}/${data.name}`
            appProjects.toggleTransformerDialog()
            appProjects.setEditNode(path)
            return
        }
      },
      openTab(data) {
        const { id, parent } = data
        const projectIdx = appProjects.list.findIndex((el) => el.name == parent)
        const queryIdx = appProjects.list[projectIdx].queries.list.findIndex(
          (el) => el.id == id
        )
        const queryData = { id, projectIdx, queryIdx }
        const isNew = !appProjects.selectedNodes.list.includes(id)
        if (isNew) {
          appProjects.toggleNodeSelection()
          appProjects.setSelectedNodes(queryData)
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import "./Sidebar.scss";
</style>
