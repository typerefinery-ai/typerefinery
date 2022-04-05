<template>
  <div class="content-area">
    <div class="tabs-wrapper">
      <TabView
        class="tab-view-wrapper"
        :class="{ draggable: focus }"
        :active-index="activeIndex"
        @tab-click="onTabClick($event)"
      >
        <TabPanel v-for="(tab, i) in tabs" :key="tab.id">
          <template #header>
            <div class="tab-item" :class="{ active: activeIndex === i }">
              <span>{{
                $t("components.project.tab") + " " + tab.id[tab.id.length - 1]
              }}</span>
              <i
                v-if="paneId !== 'pane1'"
                class="pi pi-times"
                @click.stop="closeSplitView"
              ></i>
            </div>
          </template>
          <!-- tab 1 -->
          <content-tab
            v-show="activeIndex === 0"
            :pane-id="paneId"
            :focus="focus"
            :tools-visible="contentToolsVisible"
            tab-id="tab1"
            @toggle="toggleContentTools"
          />
          <!-- tab 1 -->
          <content-tab
            v-show="activeIndex === 1"
            :pane-id="paneId"
            :focus="focus"
            :tools-visible="contentToolsVisible"
            tab-id="tab2"
            @toggle="toggleContentTools"
          />
          <!-- tab 1 -->
          <content-tab
            v-show="activeIndex === 2"
            :pane-id="paneId"
            :focus="focus"
            :tools-visible="contentToolsVisible"
            tab-id="tab3"
            @toggle="toggleContentTools"
          />
        </TabPanel>
      </TabView>

      <div
        v-show="!contentToolsVisible && !focus"
        v-tooltip="$t(`tooltips.show-content-tools`)"
        class="icon-wrapper-down hover:text-primary"
        @click="toggleContentTools"
      >
        <i class="pi pi-angle-double-down"></i>
      </div>

      <menu-bar
        v-if="focus && paneId === panes[panes.length - 1].id"
        :menu-bar-visible="contentToolsVisible"
        @toggle="toggleContentTools"
      />
    </div>
  </div>
</template>

<script>
  import TabView from "primevue/tabview"
  import TabPanel from "primevue/tabpanel"
  import MenuBar from "@/components/MenuBar.vue"
  import ContentTab from "../ContentTab"

  TabView.methods.onTabClick = function (event, i) {
    this.$emit("tab-click", {
      originalEvent: event,
      index: i,
    })
  }

  export default {
    name: "ContentView",
    components: {
      ContentTab,
      MenuBar,
      TabView,
      TabPanel,
    },

    props: {
      focus: { type: Boolean, required: true },
      tabs: { type: Array, required: true },
      paneId: { type: String, required: true },
      panes: { type: Array, required: true },
    },
    emits: ["split-view", "close-split-view"],
    data() {
      return {
        contentToolsVisible: true,
        activeIndex: 0,
      }
    },

    watch: {
      focus(isTrue) {
        if (isTrue) this.contentToolsVisible = false
        else this.contentToolsVisible = true
      },
    },

    methods: {
      onTabClick(e) {
        const ctrl = e.originalEvent?.ctrlKey
        if (ctrl) {
          this.splitView(`tab${++e.index}`)
        } else {
          this.activeIndex = e.index
        }
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

<style lang="scss">
  .tabs-wrapper {
    position: relative;
    height: 100%;

    .tab-item {
      display: flex;
      align-items: center;

      .pi-times {
        margin-left: 10px;
        font-size: 90%;
        position: relative;
        top: 1px;
      }
    }

    .icon-wrapper-down {
      position: absolute;
      top: 12px;
      right: 10px;
      cursor: pointer;
    }

    .tab-view-wrapper {
      height: 100%;
    }

    .p-tabview {
      .p-tabview-panels {
        height: calc(100% - 39px);
        padding: 0;
      }

      .p-tabview-panel {
        height: 100%;
      }
    }
  }
</style>
