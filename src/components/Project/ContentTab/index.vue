<template>
  <query
    v-if="tab.type === 'query'"
    :tools-visible="toolsVisible"
    :focus="focus"
    :tab="tab"
    :pane-id="paneId"
    @toggle="$emit('toggle')"
  />
  <project v-if="tab.type === 'project'" :tab="tab" />
  <connection v-if="tab.type === 'connection'" :tab="tab" />
  <wiring v-show="tab.type === 'wiring'" />
  <theme v-if="tab.type === 'theme'" :tab="tab" />
  <output-content v-show="tab.type === 'output'" :tab="tab" />
</template>

<script>
  import Project from "./Tabs/Project.vue"
  import Query from "./Tabs/Query.vue"
  import Connection from "./Tabs/Connection.vue"
  import Theme from "./Tabs/Theme.vue"
  import Wiring from "./Tabs/Wiring.vue"
  import OutputContent from "./Tabs/Output.vue"
  export default {
    name: "ContentTab",
    components: {
      Query,
      Project,
      Connection,
      Theme,
      Wiring,
      OutputContent,
    },
    props: {
      toolsVisible: { type: Boolean, required: true },
      focus: { type: Boolean, required: true },
      tab: { type: Object, required: true },
      paneId: { type: String, required: true },
    },
    emits: ["toggle"],
  }
</script>

<style lang="scss" scoped>
  @import "./ContentTab.scss";
</style>
