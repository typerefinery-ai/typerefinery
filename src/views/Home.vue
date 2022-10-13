<template>
  <maps v-if="$route.params.id === 'maps'" />
  <charts v-else-if="$route.params.id === 'charts'" />
  <chat v-else-if="$route.params.id === 'chat'" />
  <code-editor v-else-if="$route.params.id === 'editor'" />
  <project v-else />
  <!-- App Settings -->
  <settings v-if="settingsDialogVisible" />
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import Project from "@/components/Project"
  import Charts from "@/components/Charts"
  import Maps from "@/components/Maps"
  import Chat from "@/components/Chat"
  import CodeEditor from "@/components/CodeEditor/MonacoEditor"
  import Settings from "@/components/Settings/Settings.vue"
  import SettingsStore from "@/store/Modules/Settings"
  import ProjectsStore from "@/store/Modules/Projects"
  import ConnectionsStore from "@/store/Modules/Connections"
  import AppDataStore from "@/store/Modules/AppData"
  import QueriesStore from "@/store/Modules/Queries"
  import Themes from "@/store/Modules/Theme"
  const settingsModule = getModule(SettingsStore)
  const projectsModule = getModule(ProjectsStore)
  const connectionsModule = getModule(ConnectionsStore)
  const themesModule = getModule(Themes)
  const appDataModule = getModule(AppDataStore)
  const queriesModule = getModule(QueriesStore)

  export default {
    name: "Home",
    components: { Project, Charts, Maps, Settings, Chat, CodeEditor },
    computed: {
      settingsDialogVisible() {
        return settingsModule.data.settingsDialogVisible
      },
    },
    mounted() {
      const initialDataExists = appDataModule.data.initialDataCreated
      if (initialDataExists) this.getInitialData()
      else this.setInitialData()
    },
    methods: {
      async setInitialData() {
        try {
          await connectionsModule.createInitialConnection()
          await themesModule.createInitialTheme()
          await queriesModule.createInitialQuery()

          appDataModule.setInitialDataCreated()
          // load data
          this.getInitialData()
        } catch (err) {
          console.log(err)
        }
      },
      getInitialData() {
        projectsModule.getStoreData()
        connectionsModule.getInitialConnections()
        themesModule.getInitialThemes()
        queriesModule.getInitialQueries()
      },
    },
  }
</script>
