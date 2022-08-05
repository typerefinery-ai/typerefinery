<template>
  <div class="config-container">
    <div class="config-container-head">
      <Button
        :label="$t(`components.output.viz`)"
        class="p-button-raised"
        :class="{
          'p-button-text p-button-plain': activeView !== 'viz',
        }"
        @click="handleView('viz')"
      />
      <Button
        :label="$t(`components.output.table`)"
        class="p-button-raised"
        :class="{
          'p-button-text p-button-plain': activeView !== 'table',
        }"
        @click="handleView('table')"
      />
    </div>
    <div class="config-container-content">
      <!-- <graph-view v-show="activeView === 'viz'" /> -->
      <table-view v-show="activeView === 'table'" />
    </div>
  </div>
</template>

<script>
  import Button from "primevue/button"
  import TableView from "../Table/TableView.vue"
  // import GraphView from "../../../Workflow/FlowGraph.vue"

  export default {
    name: "Output",
    components: {
      Button,
      TableView,
      // GraphView,
    },
    data() {
      return {
        activeView: "viz",
      }
    },
    methods: {
      handleView(view) {
        this.activeView = view
      },
    },
  }
</script>

<style lang="scss" scoped>
  .config-container {
    height: 100%;
    &-head {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      border-bottom: 1px solid var(--surface-border);
      flex-flow: wrap;

      button {
        margin-right: 5px;
      }
    }
    &-content {
      display: block;
      margin: 1rem;
      height: 100%;

      .field {
        label {
          display: block;
        }
      }
      .table {
        display: flex;
        align-items: center;
        border: 1px solid var(--surface-border);
        border-radius: 4px;
      }
    }
  }
</style>
