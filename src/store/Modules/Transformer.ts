import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"

const storeValue = localStorage.getItem("transformer")
const settingsInStore = storeValue ? JSON.parse(storeValue).Transformer : false

@Module({
  name: "Transformer",
  store: store,
  dynamic: true,
  preserveState: settingsInStore,
})
export default class Transformer extends VuexModule {
  list = [
    {
      name: "Transformer1",
      code: "log('Transformer1')",
      error: "",
      logs: [],
    },
    {
      name: "Transformer2",
      code: "log('Transformer2')",
      error: "",
      logs: [],
    },
    {
      name: "Transformer3",
      code: "log('Transformer3')",
      error: "",
      logs: [],
    },
  ]

  @Mutation
  saveTransformer(transformer: object) {
    this.list.push(transformer)
  }
}
