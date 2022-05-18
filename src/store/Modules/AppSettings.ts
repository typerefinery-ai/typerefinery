import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import store from "../index"

const storeValue = localStorage.getItem("vuex")
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

  settingsDialogVisible = false
  @Mutation
  toggleSettingsDialog() {
    this.settingsDialogVisible = !this.settingsDialogVisible
  }

  settingPath = null
  @Mutation
  setSettingPath(path) {
    this.settingPath = path
  }

  @Mutation
  openSettingsDialog(path) {
    this.settingsDialogVisible = true
    this.settingPath = path
  }
}
