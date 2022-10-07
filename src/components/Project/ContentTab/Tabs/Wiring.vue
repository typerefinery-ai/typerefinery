<template>
  <div class="workflow_content">
    <div class="flow_wrapper">
      <iframe :src="path"></iframe>
      <div v-show="resizing" class="flow-overlay"></div>
    </div>
  </div>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import AppData from "@/store/Modules/AppData"
  import Settings from "@/store/Modules/Settings"
  const settingsModule = getModule(Settings)
  const appDataModule = getModule(AppData)
  export default {
    name: "WiringContent",
    props: {
      tab: { type: Object, required: true },
    },
    computed: {
      resizing() {
        return appDataModule.data.resizingFlow
      },
      path() {
        const flowId = this.tab.id
        const theme = settingsModule.data.theme
        const themeMode = theme == "light" ? 0 : 1
        return `http://localhost:8111/designer/?darkmode=${themeMode}&socket=ws%3A%2F%2Flocalhost%3A8111%2Fflows%2F${flowId}%2F&components=`
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
