<template>
  <div class="window-wrapper">
    <div v-show="toolsVisible" class="content-tools-wrapper">
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
          :label="$t(`components.tab.algorithm`)"
          class="p-button-raised"
          :class="{
            'p-button-text p-button-plain': activeView !== 'A',
          }"
          @click="handleView('A')"
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
        @click="toggleTabs"
      >
        <i class="pi pi-angle-double-up"></i>
      </div>
    </div>

    <splitpanes
      :dbl-click-splitter="false"
      :push-other-panes="false"
      @splitter-click="handleSplitterClick"
    >
      <pane :ref="`w-${tab.id}-${paneId}`">
        <div class="content-area-window" :class="{ show: activeView === 'D' }">
          <data-view :tab="tab" :view="activeView" />
        </div>

        <div class="content-area-window" :class="{ show: activeView === 'A' }">
          <algorithm-view :tab="tab" :view="activeView" />
        </div>

        <div class="content-area-window" :class="{ show: activeView === 'Q' }">
          <query-view :tab="tab" :view="activeView" />
        </div>

        <div class="content-area-window" :class="{ show: activeView === 'T' }">
          <transformer-view :tab="tab" :view="activeView" />
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
            <graph
              :graph-id="`graph-${tab.id}-${paneId}`"
              :dependencies="dependencies"
              :tab="tab"
              @set-node-data="setNodeData"
            />
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

      <pane :ref="`p-${tab.id}-${paneId}`" size="25" max-size="50">
        <side-panel
          :tab="tab"
          :node-data="nodeData"
          :active-view="activeView"
          @handle-dependencies="handleDependencies"
        />
      </pane>
    </splitpanes>
  </div>
</template>

<script>
  import FullIcon from "vue-material-design-icons/Fullscreen.vue"
  import MinusIcon from "vue-material-design-icons/MagnifyMinus.vue"
  import PlusIcon from "vue-material-design-icons/MagnifyPlus.vue"
  import ControlIcon from "vue-material-design-icons/CameraControl.vue"
  //   import InputText from "primevue/inputtext"
  import Button from "primevue/button"
  import { Splitpanes, Pane } from "splitpanes"
  import DataView from "./Views/DataView.vue"
  import QueryView from "./Views/QueryView.vue"
  import TransformerView from "./Views/TransformerView.vue"
  import AlgorithmView from "./Views/AlgorithmView.vue"
  import SidePanel from "./SidePanel"
  import Graph from "../../Graph/Graph.vue"
  import renderD3 from "../../Transformer/D3/d3"
  import renderWebcola from "../../Transformer/WebCola/webcola"
  import renderD3LabelsChart from "../../Transformer/D3Labels/d3labels"
  import AppSettings from "@/store/Modules/AppSettings"
  import { getModule } from "vuex-module-decorators"
  const appSettings = getModule(AppSettings)
  export default {
    name: "ContentTab",
    components: {
      Splitpanes,
      Pane,
      DataView,
      QueryView,
      TransformerView,
      AlgorithmView,
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
      tab: { type: Object, required: true },
      paneId: { type: String, required: true },
    },
    emits: ["toggle"],
    data() {
      return {
        activeView: "Q",
        nodeData: {},
        dependencies: [],
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
        setTimeout(() => appSettings.resizeView(), 0)
      },
      handleSplitterClick() {
        const rightPanel = this.$refs[`p-${this.tab.id}-${this.paneId}`]
        if (rightPanel.style.width == "0") {
          rightPanel.style.width = "30%"
        } else {
          this.$refs[`w-${this.tab.id}-${this.paneId}`].style.width = "100%"
          rightPanel.style.width = 0
        }
      },
      showD3Chart() {
        this.nodeData = {}
        const id = `graph-${this.tab.id}-${this.paneId}`
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
      handleDependencies(d) {
        this.dependencies = d
      },
      toggleTabs() {
        this.$emit("toggle")
      },
      setNodeData(nodeData) {
        this.nodeData = nodeData
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import "./ContentTab.scss";
</style>
