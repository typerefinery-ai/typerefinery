<template>
  <div class="content-side-panel">
    <query-info v-show="activeView === 'Q'" :tab="tab" />
    <graph-properties v-show="activeView === 'G'" :data="nodeData" :tab="tab" />
    <transformer-config
      v-show="activeView === 'T'"
      :tab="tab"
      @handle-dependencies="handleDependencies"
    />
    <algorithm-config v-show="activeView === 'A'" :tab="tab" />
  </div>
  <ConfirmDialog></ConfirmDialog>
</template>

<script>
  import GraphProperties from "./GraphProperties.vue"
  import TransformerConfig from "./TransformerConfig.vue"
  import AlgorithmConfig from "./AlgorithmConfig.vue"
  import QueryInfo from "./QueryInfo.vue"
  import ConfirmDialog from "primevue/confirmdialog"
  export default {
    name: "ContentSidePanel",
    components: {
      GraphProperties,
      TransformerConfig,
      QueryInfo,
      AlgorithmConfig,
      ConfirmDialog,
    },
    props: {
      nodeData: { type: Object, required: true },
      activeView: { type: String, required: true },
      tab: { type: Object, required: true },
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
