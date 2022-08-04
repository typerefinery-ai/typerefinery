<template>
  <query
    v-if="tab.type === 'query'"
    :tools-visible="toolsVisible"
    :focus="focus"
    :tab="tab"
    :pane-id="paneId"
    @toggle="$emit('toggle')"
  />
  <connection v-if="tab.type === 'connection'" />
  <wiring v-if="tab.type === 'wiring'" />
  <theme v-if="tab.type === 'theme'" />
  <output-content v-if="tab.type === 'output'" />
</template>

<script>
  import Query from "./Tabs/Query.vue"
  import Connection from "./Tabs/Connection.vue"
  import Theme from "./Tabs/Theme.vue"
  import Wiring from "./Tabs/Wiring.vue"
  import OutputContent from "./Tabs/Output.vue"
  export default {
    name: "ContentTab",
    components: {
      Query,
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
