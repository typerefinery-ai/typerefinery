<template>
  <div class="sidebar-container">
    <div class="sidebar-fixed">
      <div class="sidebar-fixed-items text-primary">
        <file-icon v-tooltip="$t(`tooltips.project`)" :size="20" />
      </div>
      <div class="sidebar-fixed-items hover:text-primary">
        <magnify-icon v-tooltip="$t(`tooltips.search`)" :size="20" />
      </div>
      <div class="sidebar-fixed-items hover:text-primary" @click="openSettings">
        <tune-icon v-tooltip="$t(`tooltips.settings`)" :size="25" />
      </div>
      <div class="sidebar-fixed-items hover:text-primary">
        <logout-icon
          v-on:click="logout"
          v-tooltip="$t(`tooltips.logout`)"
          :size="25"
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
      </Tree>
    </div>
  </div>
</template>

<script>
  import Tree from "primevue/tree"
  import FileIcon from "vue-material-design-icons/FileMultipleOutline.vue"
  import MagnifyIcon from "vue-material-design-icons/Magnify.vue"
  import LogoutIcon from "vue-material-design-icons/Logout.vue"
  import TuneIcon from "vue-material-design-icons/Tune.vue"
  import { getModule } from "vuex-module-decorators"
  import AppSettings from "@/store/Modules/AppSettings"
  import Projects from "@/store/Modules/Projects"
  const appSettings = getModule(AppSettings)
  const appProjects = getModule(Projects)

  export default {
    name: "Sidebar",
    components: { LogoutIcon, MagnifyIcon, FileIcon, Tree, TuneIcon },

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
        const index = 0
        return this.storeList.map((el, i) => {
          return {
            key: i,
            id: el.name.toLowerCase(),
            label: el.name,
            data: "Project Folder",
            icon: "pi pi-fw pi-briefcase",
            children: [
              {
                key: `${index}-${i}`,
                label: "Query",
                data: "Query Folder",
                icon: "pi pi-fw pi-database",
                children: el.queries.list.map((el) => {
                  return {
                    key: "0-0-0",
                    label: el.name,
                    data: "Query Folder",
                    icon: "pi pi-fw pi-file",
                  }
                }),
              },
              {
                key: `${index + 1}-${i}`,
                label: "Connection",
                data: "Connection Folder",
                icon: "pi pi-fw pi-server",
                children: el.connections.list.map((el) => {
                  return {
                    label: el.name,
                    data: "Connection Folder",
                    icon: "pi pi-fw pi-file",
                  }
                }),
              },
              {
                key: `${index + 2}-${i}`,
                label: "Transformer",
                data: "Transformer Folder",
                icon: "pi pi-fw pi-chart-bar",
                children: el.transformers.list.map((el) => {
                  return {
                    key: "0-0-i",
                    label: el.name,
                    data: "Transformer Folder",
                    icon: "pi pi-fw pi-file",
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
    },
  }
</script>

<style lang="scss" scoped>
  @import "./Sidebar.scss";
</style>
