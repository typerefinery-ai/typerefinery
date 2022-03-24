<template>
  <div class="app-main">
    <splitpanes>
      <pane v-if="!focus" class="sidbar-pane" :size="pane1Size" max-size="25">
        <sidebar />
      </pane>
      <pane
        v-for="pane in panes"
        :key="pane.id"
        class="content-pane"
        :size="panesSize"
        min-size="30"
      >
        <content-view
          :tabs="pane.tabs"
          :pane-id="pane.id"
          :focus="focus"
          @split-view="splitView"
          @close-split-view="closeSplitView"
        />
      </pane>
    </splitpanes>
  </div>
</template>

<script>
  import { Splitpanes, Pane } from "splitpanes"
  import "splitpanes/dist/splitpanes.css"
  import Sidebar from "../Sidebar"
  import ContentView from "./ContentView.vue"
  export default {
    name: "ProjectContent",
    components: {
      Sidebar,
      Splitpanes,
      Pane,
      ContentView,
    },
    props: {
      focus: {
        type: Boolean,
        required: true,
      },
    },
    data() {
      return {
        pane1Size: 25,
        panesSize: 75,
        panes: [
          {
            id: "pane1",
            tabs: [
              { id: "tab1", name: "Tab" },
              { id: "tab2", name: "Tab" },
              { id: "tab3", name: "Tab" },
            ],
          },
        ],
      }
    },
    methods: {
      splitView(id) {
        const tab = this.panes[0].tabs.find((el) => el.id === id)
        const pane = { id: "pane2", tabs: [tab] }
        if (this.panes.length === 1) {
          this.panes.push(pane)
          setTimeout(() => {
            this.pane1Size = 0
            this.panesSize = 45
          }, 0)
        } else {
          this.panes[1] = pane
        }
      },
      closeSplitView() {
        this.panes.pop()
      },
    },
  }
</script>

<style lang="scss">
  @import "./ProjectContent.scss";
</style>
