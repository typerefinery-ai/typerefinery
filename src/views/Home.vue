<template>
  <template v-if="isElectron && !moveToDashboard">
    <service-installation
      @updateMoveToDashboard="updateMoveToDashboard"
      :servicesStarted="servicesStarted"
      :getServices="getServices"
    >
    </service-installation>
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
  import Settings from "@/components/Settings/Settings.vue"
  import ServiceInstallation from "@/components/ServiceInstallation/ServiceInstallation.vue"
  import SettingsStore from "@/store/Modules/Settings"
  import Services from "@/store/Modules/Services"
  import AppDataStore from "@/store/Modules/AppData"
  const settingsModule = getModule(SettingsStore)
  const servicesModule = getModule(Services)
  const appDataModule = getModule(AppDataStore)
  export default {
    name: "Home",
    components: { Project, Settings, Toast, ServiceInstallation },
    data() {
      return {
        moveToDashboard: false,
      }
    },
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
    created() {
      // check if the user has already moved to the dashboard
      this.moveToDashboard = localStorage.getItem("moveToDashboard") == "true"
    },
    methods: {
      // get all the services
      async getServices() {
        return await servicesModule.getServices()
      },
      // get all the services
      async getGlobalEnv() {
        return await servicesModule.getGlobalEnv()
      },
      updateMoveToDashboard() {
        this.moveToDashboard = true

        // store the value in local storage
        localStorage.setItem("moveToDashboard", true)

        window.onbeforeunload = function (e) {
          window.onunload = function () {
            localStorage.setItem("moveToDashboard", false)
            window.localStorage.moveToDashboard = false
          }
          return undefined
        }
      },
    },
  }
</script>
