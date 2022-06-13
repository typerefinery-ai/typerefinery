<template>
  <div :id="graphId"></div>
</template>

<script>
  import * as d3 from "d3"
  import * as cola from "webcola"
  import Projects from "@/store/Modules/Projects"
  import { getModule } from "vuex-module-decorators"
  const projects = getModule(Projects)
  export default {
    name: "Graph",
    props: {
      graphId: { type: String, required: true },
      dependencies: { type: Array, required: true },
    },
    computed: {
      code() {
        return projects.transformerCode(0, 0)
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
        try {
          window.log = function (log) {
            projects.setLogs({ log, projectId: 0, queryId: 0 })
          }
          projects.clearLogs({ projectId: 0, queryId: 0 }) // clear logs before each execution
          const params = ["wrapper", "self", ...this.params]
          const func = new Function(...params, this.code)
          const wrapper = document.getElementById(this.graphId)
          this.removeInnerItems(wrapper)
          const args = [wrapper, this]
          const existingDependencies = { d3: d3, cola: cola }
          this.params.forEach((el) => args.push(existingDependencies[el]))
          func.apply(this, args)
          projects.setError({ error: "", projectId: 0, queryId: 0 })
        } catch (err) {
          projects.setError({ error: err.stack, projectId: 0, queryId: 0 })
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
    },
  }
</script>

<style lang="scss">
  @import "./Graph.scss";
</style>
