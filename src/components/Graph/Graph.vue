<template>
  <div :id="graphId"></div>
</template>

<script>
  import * as d3 from "d3"
  import * as cola from "webcola"
  import { getModule } from "vuex-module-decorators"
  import Projects from "@/store/Modules/Projects"
  const projectsModule = getModule(Projects)
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
        return projectsModule.getTransformerCode(projectIdx, queryIdx)
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
        const query = projectsModule.getQuery(projectIdx, queryIdx)
        try {
          window.log = function (log) {
            projectsModule.setTransformerLogs({ log, projectIdx, queryIdx })
          }
          projectsModule.clearTransformerLogs({ projectIdx, queryIdx }) // clear logs before each execution
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
          projectsModule.setTransformerError({
            error: "",
            projectIdx,
            queryIdx,
          })
        } catch (err) {
          projectsModule.setTransformerError({
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
