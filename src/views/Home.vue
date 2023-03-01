<template>
  <template v-if="!servicesStarted && isElectron">
    <loader />
  </template>
  <template v-else>
    <project v-if="$route.params.id === 'project'" />
    <!-- App Settings -->
    <settings v-if="settingsDialogVisible" />
    <Toast />
  </template>
</template>
<script>
  import { getModule } from "vuex-module-decorators"
  import Project from "@/components/Project"
  import * as electronHelpers from "@/utils/electron"
  import Toast from "primevue/toast"
  import Loader from "@/components/Loader"
  import Settings from "@/components/Settings/Settings.vue"
  import SettingsStore from "@/store/Modules/Settings"
  import Services from "@/store/Modules/Services"
  import AppDataStore from "@/store/Modules/AppData"
  const settingsModule = getModule(SettingsStore)
  const servicesModule = getModule(Services)
  const appDataModule = getModule(AppDataStore)
  export default {
    name: "Home",
    components: { Project, Settings, Loader, Toast },
    computed: {
      settingsDialogVisible() {
        return settingsModule.data.settingsDialogVisible
      },
      servicesStarted() {
        return servicesModule.data.servicesStarted
      },
      isElectron() {
        return electronHelpers.isElectron()
      },
    },
  }
</script>
