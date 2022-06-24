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
      tab: { type: Object, required: true },
    },
    computed: {
      code() {
        const { projectIdx, queryIdx } = this.tab
        return projects.transformerCode(projectIdx, queryIdx)
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
        try {
          window.log = function (log) {
            projects.setLogs({ log, projectIdx, queryIdx })
          }
          projects.clearLogs({ projectIdx, queryIdx }) // clear logs before each execution
          const params = ["wrapper", "self", ...this.params]
          const func = new Function(...params, this.code)
          const wrapper = document.getElementById(this.graphId)
          this.removeInnerItems(wrapper)
          const args = [wrapper, this]
          const existingDependencies = { d3: d3, cola: cola }
          this.params.forEach((el) => args.push(existingDependencies[el]))
          func.apply(this, args)
          projects.setError({ error: "", projectIdx, queryIdx })
        } catch (err) {
          projects.setError({ error: err.stack, projectIdx, queryIdx })
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
