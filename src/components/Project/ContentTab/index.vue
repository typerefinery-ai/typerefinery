<template>
  <div class="window-wrapper">
    <div v-show="toolsVisible" class="content-tools-wrapper">
      <div class="grid">
        <div class="col-12">
          <div class="p-inputgroup">
            <InputText :placeholder="$t(`components.project.query`)" />
            <Button icon="pi pi-search" class="p-button-primary" />
          </div>
        </div>
      </div>
      <div class="content-tools">
        <Button
          :label="$t(`components.project.query`)"
          class="p-button-raised"
          :class="{
            'p-button-text p-button-plain': activeView !== 'Q',
          }"
          @click="handleView('Q')"
        />
        <Button
          :label="$t(`components.project.data`)"
          class="p-button-raised"
          :class="{
            'p-button-text p-button-plain': activeView !== 'D',
          }"
          @click="handleView('D')"
        />
        <Button
          :label="$t(`components.project.graph`)"
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

        <div class="content-area-window" :class="{ show: activeView === 'G' }">
          <Button class="p-button-raised m-3" @click="showD3Chart"
            >Show D3 Graph</Button
          >
          <Button
            class="p-button-raised p-button-success m-3"
            @click="showWebcolaChart"
            >Show Webcola Graph</Button
          >
          <Button
            class="p-button-raised p-button-warning m-3"
            @click="showD3LabelsChart"
            >Show D3 Labels Graph</Button
          >
          <div v-if="activeView === 'G'" class="graph-container">
            <graph ref="graphPRef" />
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
        <div class="content-area-properties">
          <div class="tab-3-container">
            <Button
              :label="$t(`components.project.properties`)"
              class="p-button-raised"
              :class="{
                'p-button-text p-button-plain': activeTab3 !== 1,
              }"
              @click="handleTab3(1)"
            />
            <!-- <Button
              :label="$t(`components.project.data`)"
              class="p-button-raised"
              :class="{
                'p-button-text p-button-plain': activeTab3 !== 2,
              }"
              @click="handleTab3(2)"
            /> -->
          </div>
          <div class="tab-3-content">
            <div class="tab-3-content-item" :class="{ show: activeTab3 === 1 }">
              <properties :data="nodeData" />
            </div>
            <!-- <div class="tab-3-content-item" :class="{ show: activeTab3 === 2 }">
              <p class="text-lg">
                {{ $t("components.project.data") }}
              </p>
            </div> -->
          </div>
        </div>
      </pane>
    </splitpanes>
  </div>
</template>

<script>
  import FullIcon from "vue-material-design-icons/Fullscreen.vue"
  import MinusIcon from "vue-material-design-icons/MagnifyMinus.vue"
  import PlusIcon from "vue-material-design-icons/MagnifyPlus.vue"
  import ControlIcon from "vue-material-design-icons/CameraControl.vue"
  import InputText from "primevue/inputtext"
  import Button from "primevue/button"
  import { Splitpanes, Pane } from "splitpanes"
  import DataView from "./DataView.vue"
  import QueryView from "./QueryView.vue"
  import Properties from "./Properties.vue"
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
      InputText,
      Button,
      FullIcon,
      MinusIcon,
      PlusIcon,
      ControlIcon,
      Graph,
      Properties,
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
        activeTab3: 1,
        nodeData: {},
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
      handleTab3(index) {
        this.activeTab3 = index
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
        renderD3(this.$refs.graphPRef, this)
      },
      showWebcolaChart() {
        this.nodeData = {}
        renderWebcola(this.$refs.graphPRef, this)
      },
      showD3LabelsChart() {
        this.nodeData = {}
        renderD3LabelsChart(this.$refs.graphPRef, this)
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import "./ContentTab.scss";
</style>
