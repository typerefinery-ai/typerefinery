import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"

const storeValue = localStorage.getItem("typerefinery")
const algosInStore = storeValue ? JSON.parse(storeValue).Algorithm : false

@Module({
  name: "Algorithm",
  store: store,
  dynamic: true,
  preserveState: algosInStore,
})
export default class Algorithm extends VuexModule {
  list = [
    {
      name: "Algorithm1",
      code: "log('Algorithm1')",
      error: "",
      logs: [],
    },
    {
      name: "Algorithm2",
      code: "log('Algorithm2')",
      error: "",
      logs: [],
    },
    {
      name: "Algorithm3",
      code: "log('Algorithm3')",
      error: "",
      logs: [],
    },
  ]

  @Mutation
  saveAlgorithm(algo) {
    this.list.push(algo)
  }
}
