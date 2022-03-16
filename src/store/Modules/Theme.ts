import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"
@Module({
  name: "Theme",
  store: store,
  dynamic: true,
  preserveState: localStorage.getItem("vuex") !== null,
})
export default class Theme extends VuexModule {
  theme = "redTheme"
  @Mutation
  setTheme(text: string) {
    this.theme = text
  }
}
