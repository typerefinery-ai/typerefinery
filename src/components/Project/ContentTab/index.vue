<template>
  <div class="window-wrapper">
    <div v-show="toolsVisible" class="content-tools-wrapper">
      <div class="grid">
        <div class="col-12">
          <div class="p-inputgroup">
            <InputText :placeholder="$t(`components.tab.query`)" />
            <Button icon="pi pi-search" class="p-button-primary" />
          </div>
        </div>
      </div>
      <div class="content-tools">
        <Button
          :label="$t(`components.tab.query`)"
          class="p-button-raised"
          :class="{
            'p-button-text p-button-plain': activeView !== 'Q',
          }"
          @click="handleView('Q')"
        />
        <Button
          :label="$t(`components.tab.data`)"
          class="p-button-raised"
          :class="{
            'p-button-text p-button-plain': activeView !== 'D',
          }"
          @click="handleView('D')"
        />
        <Button
          :label="$t(`components.tab.transform`)"
          class="p-button-raised"
          :class="{
            'p-button-text p-button-plain': activeView !== 'T',
          }"
          @click="handleView('T')"
        />
        <Button
          :label="$t(`components.tab.graph`)"
          class="p-button-raised"
          :class="{
            'p-button-text p-button-plain': activeView !== 'G',
          }"
          @click="handleView('G')"
        />
      </div>
      <div
        v-tooltip="$t(`tooltips.hide-content-tools`)"
        class="icon-wrapper hover:text-primary"
        @click="$emit('toggle')"
      >
        <i class="pi pi-angle-double-up"></i>
      </div>
    </div>

    <splitpanes
      :dbl-click-splitter="false"
      :push-other-panes="false"
      @splitter-click="handleSplitterClick"
    >
      <pane :ref="`w-${tabId}-${paneId}`">
        <div class="content-area-window" :class="{ show: activeView === 'D' }">
          <data-view />
        </div>

        <div class="content-area-window" :class="{ show: activeView === 'Q' }">
          <div class="query-window-container"><query-view /></div>
        </div>

        <div class="content-area-window" :class="{ show: activeView === 'T' }">
          <transformer-view />
        </div>

        <div class="content-area-window" :class="{ show: activeView === 'G' }">
          <Button class="p-button-raised m-3 hidden" @click="showD3Chart"
            >Show D3 Graph</Button
          >
          <Button
            class="p-button-raised p-button-success m-3 hidden"
            @click="showWebcolaChart"
            >Show Webcola Graph</Button
          >
          <Button
            class="p-button-raised p-button-warning m-3 hidden"
            @click="showD3LabelsChart"
            >Show D3 Labels Graph</Button
          >
          <div class="graph-container">
            <graph :graph-id="`graph-${tabId}-${paneId}`" />
          </div>

          <div class="graph-toolbar shadow-4">
            <div class="graph-toolbar-button">
              <full-icon :size="15" />
            </div>
            <div class="graph-toolbar-button">
              <plus-icon :size="15" />
            </div>
            <div class="graph-toolbar-button">
              <minus-icon :size="15" />
            </div>
            <div class="graph-toolbar-button"><control-icon :size="15" /></div>
          </div>
        </div>
      </pane>

      <pane :ref="`p-${tabId}-${paneId}`" max-size="30">
        <side-panel :node-data="nodeData" :active-view="activeView" />
      </pane>
    </splitpanes>
  </div>
</template>

<script>
  import * as d3 from "d3"
  import FullIcon from "vue-material-design-icons/Fullscreen.vue"
  import MinusIcon from "vue-material-design-icons/MagnifyMinus.vue"
  import PlusIcon from "vue-material-design-icons/MagnifyPlus.vue"
  import ControlIcon from "vue-material-design-icons/CameraControl.vue"
  import InputText from "primevue/inputtext"
  import Button from "primevue/button"
  import { Splitpanes, Pane } from "splitpanes"
  import DataView from "./Views/DataView.vue"
  import QueryView from "./Views/QueryView.vue"
  import TransformerView from "./Views/TransformerView.vue"
  import SidePanel from "./SidePanel"
  import Graph from "../../Graph/Graph.vue"
  import renderD3 from "../../Transformer/D3/d3"
  import renderWebcola from "../../Transformer/WebCola/webcola"
  import renderD3LabelsChart from "../../Transformer/D3Labels/d3labels"
  export default {
    name: "ContentTab",
    components: {
      Splitpanes,
      Pane,
      DataView,
      QueryView,
      TransformerView,
      InputText,
      Button,
      FullIcon,
      MinusIcon,
      PlusIcon,
      ControlIcon,
      Graph,
      SidePanel,
    },
    props: {
      toolsVisible: { type: Boolean, required: true },
      focus: { type: Boolean, required: true },
      tabId: { type: String, required: true },
      paneId: { type: String, required: true },
    },
    emits: ["toggle"],
    data() {
      return {
        activeView: "Q",
        nodeData: {},
        error: "",
      }
    },
    watch: {
      focus(isTrue) {
        if (isTrue) this.handleSplitterClick()
      },
    },
    methods: {
      handleView(view) {
        this.activeView = view
      },
      handleSplitterClick() {
        const rightPanel = this.$refs[`p-${this.tabId}-${this.paneId}`]
        if (rightPanel.style.width == "0") {
          rightPanel.style.width = "30%"
        } else {
          this.$refs[`w-${this.tabId}-${this.paneId}`].style.width = "100%"
          rightPanel.style.width = 0
        }
      },
      showD3Chart() {
        this.nodeData = {}
        const id = `graph-${this.tabId}-${this.paneId}`
        const wrapper = document.getElementById(id)
        this.removeInnerItems(wrapper)
        renderD3(wrapper, this)
      },
      showWebcolaChart() {
        this.nodeData = {}
        renderWebcola(this.$refs.graphPRef, this)
      },
      showD3LabelsChart() {
        this.nodeData = {}
        renderD3LabelsChart(this.$refs.graphPRef, this)
      },
      //   renderGraph(code) {
      //     this.activeView = "G"
      //     const id = `graph-${this.tabId}-${this.paneId}`
      //     try {
      //       const func = new Function("wapper", "self", "d3", code)
      //       const wrapper = document.getElementById(id)
      //       this.removeInnerItems(wrapper)
      //       func(wrapper, this, d3)
      //       this.error = ""
      //     } catch (err) {
      //       this.error = String(err)
      //       console.log(err)
      //       console.log(err.message)
      //       console.log(err.name)
      //     }
      //   },
      //   removeInnerItems(wrapper) {
      //     // remove child elements
      //     if (wrapper.childNodes.length) {
      //       while (wrapper.hasChildNodes()) {
      //         wrapper.removeChild(wrapper.firstChild)
      //       }
      //     }
      //   },
    },
  }
</script>

<style lang="scss" scoped>
  @import "./ContentTab.scss";
</style>
