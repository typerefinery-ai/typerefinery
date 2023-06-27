<template>
  <div class="workflow_content">
    <splitpanes
      :dbl-click-splitter="false"
      :push-other-panes="false"
      @splitter-click="handleSplitterClick"
    >
      <pane ref="flowPane" size="50">
        <div class="flow_wrapper">
          <iframe src="http://flow.typerefinery.localhost:8100"></iframe>
        </div>
      </pane>
      <pane ref="graphPane" size="50">
        <flow-graph />
      </pane>
    </splitpanes>
  </div>
</template>

<script>
  import { Splitpanes, Pane } from "splitpanes"
  import FlowGraph from "./FlowGraph.vue"
  export default {
    name: "FlowUI",
    components: { Splitpanes, Pane, FlowGraph },
    methods: {
      handleSplitterClick() {
        const gPane = this.$refs.graphPane
        const fPane = this.$refs.flowPane
        if (gPane.style.width == "0") {
          gPane.style.width = "50%"
          fPane.style.width = "50%"
        } else {
          gPane.style.width = 0
          fPane.style.width = "100%"
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  .workflow_content {
    height: 100%;
  }

  .flow_wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    iframe {
      width: 100%;
      height: 100%;
    }
  }
</style>
