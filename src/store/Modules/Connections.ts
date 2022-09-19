/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"
// import sampleData from "@/data/default.json"

@Module({
  name: "Connections",
  store: store,
  dynamic: true,
  preserveState: localStorage.getItem("connections") !== null,
})
export default class Connections extends VuexModule {
  data: any = { list: [] }

  get getGlobalConnections() {
    return this.data.list
  }

  @Mutation
  addGlobalConnection(connection) {
    this.data.list.push(connection)
  }

  // @Mutation
  // editGlobalConnection(connectionData) {
  //   const { connectionIdx, data } = connectionData
  //   const connections = JSON.parse(JSON.stringify(this.data.list))
  //   connections[connectionIdx] = data
  //   this.data.list = connections
  // }

  @Mutation
  updateGlobalConnection(connectionData) {
    const { connectionIdx, key, value } = connectionData
    const connections = JSON.parse(JSON.stringify(this.data))
    connections.list[connectionIdx][key] = value
    this.data = connections
  }
}
