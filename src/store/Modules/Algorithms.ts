/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"
// import sampleData from "@/data/default.json"

@Module({
  name: "Algorithms",
  store: store,
  dynamic: true,
  preserveState: localStorage.getItem("algorithms") !== null,
})
export default class Algorithms extends VuexModule {
  data: any = { list: [] }

  get getGlobalAlgorithms() {
    return this.data.list
  }

  @Mutation
  addGlobalAlgorithm(algorithm) {
    this.data.list.push(algorithm)
  }

  @Mutation
  editGlobalAlgorithm(algorithmData) {
    const { algorithmIdx, data } = algorithmData
    const algorithms = JSON.parse(JSON.stringify(this.data.list))
    algorithms[algorithmIdx] = data
    this.data.list = algorithms
  }
}
