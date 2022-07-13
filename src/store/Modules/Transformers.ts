import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"
import sampleData from "@/data/default.json"

@Module({
  name: "Transformers",
  store: store,
  dynamic: true,
  preserveState: localStorage.getItem("transformers") !== null,
})
export default class Transformers extends VuexModule {
  data = sampleData.transformers

  get getGlobalTransformers() {
    return this.data.list
  }

  @Mutation
  addGlobalTransformer(transformer) {
    this.data.list.push(transformer)
  }

  @Mutation
  editGlobalTransformer(transformerData) {
    const { transformerIdx, data } = transformerData
    const transformers = JSON.parse(JSON.stringify(this.data.list))
    transformers[transformerIdx] = data
    this.data.list = transformers
  }
}
