<template>
  <div class="window-wrapper">
    <div v-show="toolsVisible" class="content-tools-wrapper">
      <div class="query-bar">
        <input type="text" value="QUERY" />
        <button>R</button>
      </div>
      <div class="content-tools">
        <div
          class="content-tool"
          :class="{ active: activeView === 'Q' }"
          @click="handleView('Q')"
        >
          Q
        </div>
        <div
          class="content-tool"
          :class="{ active: activeView === 'D' }"
          @click="handleView('D')"
        >
          D
        </div>
        <div
          class="content-tool"
          :class="{ active: activeView === 'G' }"
          @click="handleView('G')"
        >
          G
        </div>
      </div>
      <div class="icon-wrapper" @click="$emit('toggle')">
        <v-icon large color="darken-2"> mdi-chevron-up </v-icon>
      </div>
    </div>

    <splitpanes
      :dbl-click-splitter="false"
      @splitter-click="handleSplitterClick(true)"
    >
      <pane :id="`content-area-window-${tabId}-${paneId}`">
        <div class="content-area-window" :class="{ show: activeView === 'D' }">
          <data-view />
        </div>

        <div class="content-area-window" :class="{ show: activeView === 'Q' }">
          <div class="query-window-container"><query-view /></div>
        </div>

        <div class="content-area-window" :class="{ show: activeView === 'G' }">
          <div class="graph-toolbar">
            <div class="graph-toolbar-button">F</div>
            <div class="graph-toolbar-button">+</div>
            <div class="graph-toolbar-button">-</div>
            <div class="graph-toolbar-button">C</div>
          </div>
        </div>
      </pane>

      <pane :id="`content-area-properties-${tabId}-${paneId}`" max-size="30">
        <div class="content-area-properties">
          <div class="tab-3-container">
            <div
              class="tab-3-item"
              :class="{ active: activeTab3 === 1 }"
              @click="handleTab3(1)"
            >
              P
            </div>
            <div
              class="tab-3-item"
              :class="{ active: activeTab3 === 2 }"
              @click="handleTab3(2)"
            >
              D
            </div>
          </div>
          <div class="tab-3-content">
            <div class="tab-3-content-item" :class="{ show: activeTab3 === 1 }">
              Properties
            </div>
            <div class="tab-3-content-item" :class="{ show: activeTab3 === 2 }">
              Data
            </div>
          </div>
        </div>
      </pane>
    </splitpanes>
  </div>
</template>

<script>
  import { Splitpanes, Pane } from "splitpanes"
  import DataView from "./DataView.vue"
  import QueryView from "./QueryView.vue"
  export default {
    name: "ContentTab",
    components: { Splitpanes, Pane, DataView, QueryView },
    props: {
      toolsVisible: { type: Boolean, required: true },
      focus: { type: Boolean, required: true },
      tabId: { type: String, required: true },
      paneId: { type: String, required: true },
    },
    emits: ["toggle"],
    data() {
      return {
        activeView: "G",
        contentToolsVisible: true,
        activeTab3: 1,
      }
    },
    watch: {
      focus(isTrue) {
        if (isTrue) this.handleSplitterClick(true)
      },
    },
    methods: {
      handleView(view) {
        this.activeView = view
      },
      handleTab3(index) {
        this.activeTab3 = index
      },
      handleSplitterClick(toRight) {
        if (toRight) {
          document.getElementById(
            `content-area-window-${this.tabId}-${this.paneId}`
          ).style.width = "100%"
          document.getElementById(
            `content-area-properties-${this.tabId}-${this.paneId}`
          ).style.width = 0
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import "./ContentTab.scss";
</style>
