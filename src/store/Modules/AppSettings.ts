import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"

const storeValue = localStorage.getItem("typerefinery")
const settingsInStore = storeValue ? JSON.parse(storeValue).AppSettings : false

@Module({
  name: "AppSettings",
  store: store,
  dynamic: true,
  preserveState: settingsInStore,
})
export default class AppSettings extends VuexModule {
  language = ""
  @Mutation
  setLanguage(text: string) {
    this.language = text
  }

  theme = "light"
  @Mutation
  setTheme(text: string) {
    this.theme = text
  }

  focus = false
  @Mutation
  toggleFocus() {
    this.focus = !this.focus
  }

  viewResized = false
  @Mutation
  resizeView() {
    this.viewResized = !this.viewResized
  }

  settingsDialogVisible = false
  @Mutation
  toggleSettingsDialog() {
    this.settingsDialogVisible = !this.settingsDialogVisible
  }

  settingPath = null
  @Mutation
  setSettingPath(path: null) {
    this.settingPath = path
  }

  @Mutation
  openSettingsDialog(path: null) {
    this.settingsDialogVisible = true
    this.settingPath = path
  }

  settings = [
    {
      id: "general",
      label: "General",
      icon: "pi pi-cog",
    },
    {
      id: "profile",
      label: "Profile",
      icon: "pi pi-user",
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: "pi pi-lock",
    },
    {
      id: "services",
      label: "Services",
      icon: "pi pi-cog",
    },
  ]

  experimentalFeatures = [
    {
      id: "chat",
      label: "Chat",
      enabled: false,
    },
    {
      id: "editor",
      label: "Editor",
      enabled: false,
    },
  ]

  @Mutation
  toggleExperimentalFeatures(args: { id: string; enabled: boolean }) {
    const expIdx = this.experimentalFeatures.findIndex(
      (el) => el.id === args.id
    )
    this.experimentalFeatures[expIdx].enabled = args.enabled
  }

  get featureStatus() {
    return (id: string) => {
      const expIdx = this.experimentalFeatures.findIndex((el) => el.id === id)
      return this.experimentalFeatures[expIdx].enabled
    }
  }
}
