import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import store from "../index"

const storeValue = localStorage.getItem("vuex")
const AuthInStore = storeValue ? JSON.parse(storeValue).Auth : false
@Module({
  name: "Auth",
  store: store,
  dynamic: true,
})
export default class Auth extends VuexModule {
  username: string = "Rahul Shaw"
  email: string = "rshaw@aapnainfotech.com"
  get user() {
    return this.username
  }
  get mail() {
    return this.email
  }

  @Mutation
  SET_ALIAS_NAME(username: string) {
    this.username = username
  }

  @Action
  SetAlias(username: string) {
    this.SET_ALIAS_NAME(username)
  }
}
