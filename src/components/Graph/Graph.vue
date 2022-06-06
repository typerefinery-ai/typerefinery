<template>
  <div :id="graphId"></div>
</template>

<script>
  import * as d3 from "d3"
  import * as cola from "webcola"
  import Transformer from "@/store/Modules/Transformer"
  import { getModule } from "vuex-module-decorators"
  const transformer = getModule(Transformer)
  export default {
    name: "Graph",
    props: { graphId: { type: String, required: true } },
    computed: {
      code() {
        return transformer.code
      },
    },
    watch: {
      code() {
        this.renderGraph()
      },
    },
    mounted() {
      this.renderGraph()
    },

    methods: {
      renderGraph() {
        try {
          window.log = function (x) {
            transformer.setLogs(x)
          }
          transformer.clearLogs() // clear logs before each execution
          const func = new Function("wrapper", "self", "d3", "cola", this.code)
          const wrapper = document.getElementById(this.graphId)
          this.removeInnerItems(wrapper)
          func(wrapper, this, d3, cola)
          transformer.setError("")
        } catch (err) {
          transformer.setError(err.stack)
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
