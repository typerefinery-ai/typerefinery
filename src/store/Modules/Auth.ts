import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"
import sampleData from "@/data/default.json"

@Module({
  name: "Auth",
  store: store,
  dynamic: true,
  preserveState: localStorage.getItem("auth") !== null,
})
export default class Auth extends VuexModule {
  data = sampleData.auth

  @Mutation
  setUsername(username: string) {
    this.data.username = username
  }
  @Mutation
  setAliasname(alias: string) {
    this.data.alias = alias
  }
  @Mutation
  setEmail(email: string) {
    this.data.email = email
  }
}
