<template>
  <div class="content-side-panel">
    <query-info v-show="activeView === 'Q'" />
    <graph-properties v-show="activeView === 'G'" :data="nodeData" />
    <transformer-config
      v-show="activeView === 'T'"
      @handle-dependencies="handleDependencies"
    />
  </div>
</template>

<script>
  import GraphProperties from "./GraphProperties.vue"
  import TransformerConfig from "./TransformerConfig.vue"
  import QueryInfo from "./QueryInfo.vue"
  export default {
    name: "ContentSidePanel",
    components: { GraphProperties, TransformerConfig, QueryInfo },
    props: {
      nodeData: { type: Object, required: true },
      activeView: { type: String, required: true },
    },
    emits: ["handle-dependencies"],
    methods: {
      handleDependencies(d) {
        this.$emit("handle-dependencies", d)
      },
    },
  }
</script>

<style scoped lang="scss"></style>
