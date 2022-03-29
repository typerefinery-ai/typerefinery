import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"

@Module({
  name: "AppSettings",
  store: store,
  dynamic: true,
  preserveState: localStorage.getItem("vuex") !== null,
})
export default class AppSettings extends VuexModule {
  language = "hi"
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
}
