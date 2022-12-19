<template>
  <div :id="graphId"></div>
</template>

<script>
  import * as d3 from "d3"
  import * as webcola from "webcola"
  import { getModule } from "vuex-module-decorators"
  import Projects from "@/store/Modules/Projects"
  import axios from "axios"
  const projectsModule = getModule(Projects)
  export default {
    name: "Graph",
    props: {
      graphId: { type: String, required: true },
      dependencies: { type: Array, required: true },
      tab: { type: Object, required: true },
    },
    emits: ["set-node-data"],
    data() {
      return {
        graphData: {},
      }
    },
    computed: {
      code() {
        const { projectIdx, queryIdx } = this.tab
        return projectsModule.getTransformerCode(projectIdx, queryIdx)
      },
      params() {
        return this.dependencies
      },
      path() {
        const { projectIdx, queryIdx } = this.tab
        return projectsModule.getQuery(projectIdx, queryIdx).dataPath
      },
    },
    watch: {
      code() {
        this.renderGraph()
      },
      params() {
        this.getGraphData()
      },
      path() {
        this.getGraphData()
      },
    },
    mounted() {
      this.getGraphData()
    },
    methods: {
      async getGraphData() {
        const { projectIdx, queryIdx } = this.tab
        const query = projectsModule.getQuery(projectIdx, queryIdx)
        const origin = new URL(query.endpoint).origin
        if (query.dataPath) {
          try {
            const { data } = await restapi.get(origin + query.dataPath)
            this.graphData = data
            this.renderGraph()
          } catch (err) {
            console.log(err)
            this.graphData = {}
          }
        } else {
          this.renderGraph()
        }
      },
      async renderGraph() {
        const { projectIdx, queryIdx } = this.tab
        try {
          window.log = function (log) {
            projectsModule.setTransformerLogs({ log, projectIdx, queryIdx })
          }
          projectsModule.clearTransformerLogs({ projectIdx, queryIdx }) // clear logs before each execution
          const params = ["Wrapper", "self", "Graph_Data", ...this.params]
          const func = new Function(...params, this.code)
          const wrapper = document.getElementById(this.graphId)
          this.removeInnerItems(wrapper)
          const args = [wrapper, this, this.graphData]
          const existingDependencies = {
            d3: d3,
            webcola: webcola,
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
