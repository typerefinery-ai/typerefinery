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
        class="icon-wrapper hover:text-indigo-500"
        @click="$emit('toggle')"
      >
        <i class="pi pi-angle-double-up"></i>
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
            <div class="graph-toolbar-button"><full-icon :size="15" /></div>
            <div class="graph-toolbar-button"><plus-icon :size="15" /></div>
            <div class="graph-toolbar-button"><minus-icon :size="15" /></div>
            <div class="graph-toolbar-button"><control-icon :size="15" /></div>
          </div>
        </div>
      </pane>

      <pane :id="`content-area-properties-${tabId}-${paneId}`" max-size="30">
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
            <Button
              :label="$t(`components.project.data`)"
              class="p-button-raised"
              :class="{
                'p-button-text p-button-plain': activeTab3 !== 2,
              }"
              @click="handleTab3(2)"
            />
          </div>
          <div class="tab-3-content">
            <div class="tab-3-content-item" :class="{ show: activeTab3 === 1 }">
              <p class="text-lg">
                {{ $t("components.project.properties") }}
              </p>
            </div>
            <div class="tab-3-content-item" :class="{ show: activeTab3 === 2 }">
              <p class="text-lg">
                {{ $t("components.project.data") }}
              </p>
            </div>
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
        console.log("clicked")
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
