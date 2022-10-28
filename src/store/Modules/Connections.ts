/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "@/axios"
import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
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
  addGlobalConnections(connections) {
    this.data.list = connections
  }

  @Mutation
  addGlobalConnection(connection) {
    if (connection.type === "connection") this.data.list.push(connection)
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
    const { connectionIdx, data } = connectionData
    const connections = JSON.parse(JSON.stringify(this.data))
    connections.list[connectionIdx] = data
    this.data = connections
  }

  @Action
  async createInitialConnection() {
    try {
      const connection = {
        connectionid: "defaultconnection",
        id: "defaultconnection",
        projectid: null,
        label: "Global Connection",
        icon: "",
        type: "connection",
        scope: "global",
        description: "",
        port: "1729",
        host: "localhost",
        database: "typerefinery",
      }
      await axios.post(`/datastore/connection`, connection)
      this.context.commit("addGlobalConnection", connection)
    } catch (error) {
      console.log(error)
      this.context.commit("addGlobalConnection", {})
    }
  }

  @Action
  async getInitialConnections() {
    try {
      const res = await axios.get("/datastore/connection")
      const data = res.data
        .filter((el) => el.scope === "global")
        .map((el) => ({ ...el, id: el.connectionid }))
      this.context.commit("addGlobalConnections", data)
    } catch (err) {
      console.log(err)
    }
  }

  @Action
  async setGlobalConnection({ data, connectionIdx }) {
    const connections = this.context.getters["getGlobalConnections"]
    const connection = connections[connectionIdx]
    const payload = { ...connection, ...data }
    try {
      await axios.put(`/datastore/connection/${data.id}`, payload)
      this.context.commit("updateGlobalConnection", { data, connectionIdx })
    } catch (err) {
      console.log(err)
    }
  }
}
