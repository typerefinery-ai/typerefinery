import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import store from "../index"

// const storeValue = localStorage.getItem("vuex")
// const AuthInStore = storeValue ? JSON.parse(storeValue).Auth : false
@Module({
  name: "Auth",
  store: store,
  dynamic: true,
  preserveState: localStorage.getItem("vuex") !== null,
})
export default class Auth extends VuexModule {
  username: string = "Rahul Shaw"
  email: string = "rshaw@aapnainfotech.com"
  alias: string = "rshaw"
  @Mutation
  setUsername(username: string) {
    this.username = username
  }

  @Mutation
  setAliasname(alias: string) {
    this.alias = alias
  }
  @Mutation
  setEmail(email: string) {
    this.email = email
  }
}
