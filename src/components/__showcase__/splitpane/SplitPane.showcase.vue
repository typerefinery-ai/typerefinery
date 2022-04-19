<template>
  <div style="height: 100vh">
    <splitpanes
      :dbl-click-splitter="false"
      :push-other-panes="false"
      @splitter-click="handleSplitterClick"
    >
      <pane ref="sidebarPane" :class="{ minimized: panWidth === 0 }" size="25">
        <span>1</span>
      </pane>
      <pane size="10">
        <span>2</span>
      </pane>
      <pane size="25">
        <span>3</span>
      </pane>
    </splitpanes>
  </div>
</template>

<script>
  import { Splitpanes, Pane } from "splitpanes"
  import "splitpanes/dist/splitpanes.css"
  export default {
    name: "Splitpane",
    components: {
      Splitpanes,
      Pane,
    },
    data() {
      return {
        panWidth: 1,
      }
    },
    methods: {
      handleSplitterClick(e) {
        if (e.index !== 1) return
        const pane = this.$refs.sidebarPane
        if (pane.style.width == "0") {
          pane.style.width = "25%"
          this.panWidth++
        } else {
          pane.style.width = 0
          this.panWidth = 0
        }
      },
    },
  }
</script>
<style>
  .minimized {
    width: 0;
  }
</style>
