import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import store from "../index"

const storeValue = localStorage.getItem("vuex")
const authInStore = storeValue ? JSON.parse(storeValue).Auth : false
@Module({
  name: "Auth",
  store: store,
  dynamic: true,
  preserveState: authInStore,
})
export default class Auth extends VuexModule {
  username = "Rahul Shaw"
  email = "rshaw@aapnainfotech.com"
  alias = "rshaw"
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
