import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import store from "../index"

const storeValue = localStorage.getItem("auth")
const authInStore = storeValue ? JSON.parse(storeValue).Auth : false
@Module({
  name: "Auth",
  store: store,
  dynamic: true,
  preserveState: authInStore,
})
export default class Auth extends VuexModule {
  username = "TypeRefinery User"
  email = "info@typerefinery.io"
  alias = "Me"
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
