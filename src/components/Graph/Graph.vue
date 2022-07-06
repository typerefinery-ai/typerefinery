<template>
  <div :id="graphId"></div>
</template>

<script>
  import * as d3 from "d3"
  import * as cola from "webcola"
  import AppData from "@/store/Modules/Projects"
  import { getModule } from "vuex-module-decorators"
  const appData = getModule(AppData)
  export default {
    name: "Graph",
    props: {
      graphId: { type: String, required: true },
      dependencies: { type: Array, required: true },
      tab: { type: Object, required: true },
    },
    emits: ["set-node-data"],
    computed: {
      code() {
        const { projectIdx, queryIdx } = this.tab
        return appData.transformerCode(projectIdx, queryIdx)
      },
      params() {
        return this.dependencies
      },
    },
    watch: {
      code() {
        this.renderGraph()
      },
      params() {
        this.renderGraph()
      },
    },
    mounted() {
      this.renderGraph()
    },

    methods: {
      renderGraph() {
        const { projectIdx, queryIdx } = this.tab
        const query = appData.list[0].list[projectIdx].queries.list[queryIdx]
        try {
          window.log = function (log) {
            appData.setTransformerLogs({ log, projectIdx, queryIdx })
          }
          appData.clearTransformerLogs({ projectIdx, queryIdx }) // clear logs before each execution
          const params = ["wrapper", "self", "output", ...this.params]
          const func = new Function(...params, this.code)
          const wrapper = document.getElementById(this.graphId)
          this.removeInnerItems(wrapper)
          const args = [wrapper, this, query.dataPath]
          const existingDependencies = {
            d3: d3,
            cola: cola,
          }
          this.params.forEach((el) => args.push(existingDependencies[el]))
          func.apply(this, args)
          appData.setTransformerError({ error: "", projectIdx, queryIdx })
        } catch (err) {
          appData.setTransformerError({
            error: err.stack,
            projectIdx,
            queryIdx,
          })
        }
      },
      removeInnerItems(wrapper) {
        // remove child elements
        if (wrapper.childNodes.length) {
          while (wrapper.hasChildNodes()) {
            wrapper.removeChild(wrapper.firstChild)
          }
        }
      },
      setNodeData(nodeData) {
        this.$emit("set-node-data", nodeData)
      },
    },
  }
</script>

<style lang="scss">
  @import "./Graph.scss";
</style>
