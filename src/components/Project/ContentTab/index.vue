<template>
  <query
    v-if="tab.type === 'query'"
    :tools-visible="toolsVisible"
    :focus="focus"
    :tab="tab"
    :pane-id="paneId"
    :dirty-tabs="dirtyTabs"
    @toggle="$emit('toggle')"
    @input="handleEmit"
    @check-tab-if-dirty="checkTabIfDirty"
  />
  <project
    v-if="tab.type === 'project'"
    :tab="tab"
    :dirty-tabs="dirtyTabs"
    @check-tab-if-dirty="checkTabIfDirty"
    @input="handleEmit"
  />
  <connection
    v-if="tab.type === 'connection'"
    :tab="tab"
    :dirty-tabs="dirtyTabs"
    @check-tab-if-dirty="checkTabIfDirty"
    @input="handleEmit"
  />
  <wiring v-show="tab.type === 'wiring'" :tab="tab" />
  <theme
    v-if="tab.type === 'theme'"
    :tab="tab"
    :dirty-tabs="dirtyTabs"
    @check-tab-if-dirty="checkTabIfDirty"
    @input="handleEmit"
  />
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
      dirtyTabs: { type: Object, required: true },
    },
    emits: ["toggle", "input", "check-tab-if-dirty"],
    methods: {
      handleEmit(payload) {
        this.$emit("input", payload)
      },
      checkTabIfDirty(tabId) {
        return this.$emit("check-tab-if-dirty", tabId)
      },
    },
  }
</script>
<style lang="scss" scoped>
  @import "./ContentTab.scss";
</style>
