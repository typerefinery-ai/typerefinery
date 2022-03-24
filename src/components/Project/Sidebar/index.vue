<template>
  <div class="sidebar-container">
    <div class="sidebar-fixed">
      <div class="sidebar-fixed-items text-indigo-500">
        <file-icon v-tooltip="'Project'" :size="20" />
      </div>
      <div class="sidebar-fixed-items hover:text-indigo-500">
        <magnify-icon v-tooltip="'Search'" :size="20" />
      </div>
      <div class="sidebar-fixed-items hover:text-indigo-500">
        <logout-icon v-tooltip="'Logout'" :size="25" />
      </div>
    </div>
    <div id="sidebar-draggable" class="sidebar-draggable">
      <Tree
        class="h-full tree-wrapper"
        :value="nodes"
        :filter="true"
        filter-mode="lenient"
        :expanded-keys="expandedKeys"
      ></Tree>
    </div>
  </div>
</template>

<script>
  import Tree from "primevue/tree"
  import NodeService from "@/components/Tree/NodeService"
  import FileIcon from "vue-material-design-icons/FileMultipleOutline.vue"
  import MagnifyIcon from "vue-material-design-icons/Magnify.vue"
  import LogoutIcon from "vue-material-design-icons/Logout.vue"
  export default {
    name: "Sidebar",
    components: { LogoutIcon, MagnifyIcon, FileIcon, Tree },
    data() {
      return {
        nodes: null,
        expandedKeys: {},
      }
    },
    nodeService: null,
    created() {
      this.nodeService = new NodeService()
    },
    mounted() {
      this.nodes = this.nodeService.getTreeNodes().root
      this.expandedKeys[this.nodes[0].key] = true
      this.expandedKeys[this.nodes[1].key] = true
    },
  }
</script>

<style lang="scss" scoped>
  @import "./Sidebar.scss";
</style>
