<template>
  <div class="sidebar-container">
    <div class="sidebar-fixed">
      <div class="sidebar-fixed-items text-primary">
        <file-icon v-tooltip="$t(`tooltips.project`)" :size="20" />
      </div>
      <div class="sidebar-fixed-items hover:text-primary">
        <magnify-icon v-tooltip="$t(`tooltips.search`)" :size="20" />
      </div>
      <div class="sidebar-fixed-items hover:text-primary">
        <logout-icon v-tooltip="$t(`tooltips.logout`)" :size="25" />
      </div>
    </div>
    <div id="sidebar-draggable" class="sidebar-draggable">
      <Tree
        class="h-full tree-wrapper"
        :value="nodes"
        :filter="true"
        filter-mode="lenient"
        :expanded-keys="expandedKeys"
      >
        <template #default="slotProps">
          {{
            slotProps.node.id
              ? $t(`components.project.${slotProps.node.id}`)
              : slotProps.node.label
          }}
        </template>
      </Tree>
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
