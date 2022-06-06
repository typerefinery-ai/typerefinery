<template>
  <div class="content-side-panel">
    <properties v-if="activeView === 'G'" :data="nodeData" />
    <transformer-config v-if="activeView === 'T'" />
  </div>
</template>

<script>
  import Properties from "./Properties.vue"
  import TransformerConfig from "./TransformerConfig.vue"
  export default {
    name: "ContentSidePanel",
    components: { Properties, TransformerConfig },
    props: {
      nodeData: { type: Object, required: true },
      activeView: { type: String, required: true },
    },
    data() {
      return {
        activeTab: 1,
      }
    },
    methods: {
      handleTab(id) {
        this.activeTab = id
      },
    },
  }
</script>

<style scoped lang="scss"></style>
