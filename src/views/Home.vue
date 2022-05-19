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
import AppSettings from "@/store/Modules/AppSettings"
const appSettings = getModule(AppSettings)

export default {
  name: "Home",
  components: { Project, Charts, Maps, Settings, Chat, CodeEditor },
  computed: {
    settingsDialogVisible() {
      return appSettings.settingsDialogVisible
    },
  },
}
</script>
