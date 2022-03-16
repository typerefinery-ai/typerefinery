<template>
  <div class="content-area">
    <div class="tabs-wrapper">
      <div class="tab-2-container" :class="{ 'focus-mode': focus }">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-2-item"
          :class="{ active: activeTab === tab.id && paneId === 'pane1' }"
          @click.ctrl="splitView(tab.id)"
          @click.exact="handleTab(tab.id)"
        >
          <span>{{ tab.name }}</span>
          <span
            v-if="paneId !== 'pane1'"
            class="close"
            @click.stop="closeSplitView"
            >&times;</span
          >
        </div>

        <div
          v-show="!contentToolsVisible"
          class="icon-wrapper-down"
          @click="toggleContentTools"
        >
          <v-icon large color="darken-2"> mdi-chevron-down </v-icon>
        </div>
      </div>

      <div v-if="focus" class="menu-bar">
        <div class="menu-item" @click="$emit('toggle-theme')">T</div>
        <div class="menu-item" @click="$emit('toggle-focus')">F</div>
        <div class="menu-item">-</div>
        <div class="menu-item">o</div>
        <div class="menu-item">x</div>
      </div>
    </div>

    <!-- tab 1 -->
    <content-tab
      v-show="activeTab === 'tab1'"
      :pane-id="paneId"
      :focus="focus"
      :tools-visible="contentToolsVisible"
      tab-id="tab1"
      @toggle="toggleContentTools"
    />
    <!-- tab 1 -->
    <content-tab
      v-show="activeTab === 'tab2'"
      :pane-id="paneId"
      :focus="focus"
      :tools-visible="contentToolsVisible"
      tab-id="tab2"
      @toggle="toggleContentTools"
    />
    <!-- tab 1 -->
    <content-tab
      v-show="activeTab === 'tab3'"
      :pane-id="paneId"
      :focus="focus"
      :tools-visible="contentToolsVisible"
      tab-id="tab3"
      @toggle="toggleContentTools"
    />
  </div>
</template>

<script>
  import ContentTab from "../ContentTab"
  export default {
    name: "ContentView",
    components: {
      ContentTab,
    },

    props: {
      focus: { type: Boolean, required: true },
      tabs: { type: Array, required: true },
      paneId: { type: String, required: true },
    },
    emits: ["toggle-focus", "toggle-theme", "split-view", "close-split-view"],
    data() {
      return {
        activeTab: this.tabs[0].id,
        contentToolsVisible: true,
      }
    },
    watch: {
      focus(isTrue) {
        if (isTrue) this.contentToolsVisible = false
        else this.contentToolsVisible = true
      },
    },
    methods: {
      handleTab(index) {
        if (this.paneId !== "pane1") return
        this.activeTab = index
      },

      toggleContentTools() {
        this.contentToolsVisible = !this.contentToolsVisible
      },

      splitView(id) {
        this.$emit("split-view", id)
      },

      closeSplitView() {
        this.$emit("close-split-view")
      },
    },
  }
</script>
