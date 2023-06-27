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
  import Services from "@/store/Modules/Services"
  const settingsModule = getModule(Settings)
  const servicesModule = getModule(Services)
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
      port() {
        const services = servicesModule.data.services
        const flowService = services.find((el) => el.id === "totaljs-flow")
        return flowService?.serviceport ?? 8111
      },
      path() {
        const flowId = this.tab.id
        const theme = settingsModule.data.theme
        const themeMode = theme == "light" ? 0 : 1
        return `http://flow.typerefinery.localhost:8100/designer/?darkmode=${themeMode}&socket=ws%3A%2F%2Fflow.typerefinery.localhost%3A8100%2Fflows%2F${flowId}%2F&components=`
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
