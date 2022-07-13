import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"
import sampleData from "@/data/default.json"

@Module({
  name: "Settings",
  store: store,
  dynamic: true,
  preserveState: localStorage.getItem("settings") !== null,
})
export default class Settings extends VuexModule {
  data = sampleData.settings

  // Getters
  get getFeatureStatus() {
    return (id: string) => {
      const expIdx = this.data.experimentalFeatures.findIndex(
        (el) => el.id === id
      )
      return this.data.experimentalFeatures[expIdx].enabled
    }
  }

  // Mutations
  @Mutation
  setLanguage(text: string) {
    this.data.language = text
  }

  @Mutation
  setTheme(text: string) {
    this.data.theme = text
  }

  @Mutation
  toggleFocus() {
    this.data.focus = !this.data.focus
  }

  @Mutation
  resizeView() {
    this.data.viewResized = !this.data.viewResized
  }

  @Mutation
  toggleSettingsDialog() {
    this.data.settingsDialogVisible = !this.data.settingsDialogVisible
  }

  @Mutation
  setSettingPath(path: null) {
    this.data.settingPath = path
  }

  @Mutation
  openSettingsDialog(path: null) {
    this.data.settingsDialogVisible = true
    this.data.settingPath = path
  }

  @Mutation
  toggleExperimentalFeatures(args: { id: string; enabled: boolean }) {
    const expIdx = this.data.experimentalFeatures.findIndex(
      (el) => el.id === args.id
    )
    this.data.experimentalFeatures[expIdx].enabled = args.enabled
  }
}
