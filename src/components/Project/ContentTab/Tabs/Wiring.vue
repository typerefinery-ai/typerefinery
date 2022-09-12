<template>
  <div class="workflow_content">
    <div class="flow_wrapper">
      <iframe src="http://localhost:8111/"></iframe>
      <div v-show="resizing" class="flow-overlay"></div>
    </div>
  </div>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import AppData from "@/store/Modules/AppData"
  const appDataModule = getModule(AppData)
  export default {
    name: "WiringContent",
    computed: {
      resizing() {
        return appDataModule.data.resizingFlow
      },
    },
  }
</script>

<style lang="scss">
  .workflow_content {
    height: 100%;
  }

  .flow_wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    position: relative;

    .flow-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: transparent;
      z-index: 2;
    }

    iframe {
      width: 100%;
      height: 100%;
    }
  }
</style>
