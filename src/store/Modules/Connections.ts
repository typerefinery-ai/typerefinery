/* eslint-disable @typescript-eslint/no-explicit-any */
import restapi from "@/utils/restapi"
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
    if (connection.type === "connection") {
      this.data.list.push(connection)
    }
  }

  @Action({ rawError: true })
  async createGlobalConnection(connection) {
    try {
      await restapi.post(`/datastore/connection`, connection)
      this.context.commit("addGlobalConnection", connection)
    } catch (error) {
      console.log(error)
    }
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

  @Mutation
  deleteConnectionGlobally(data) {
    const connection = JSON.parse(JSON.stringify(this.data.list))
    const connectionIdx = connection.findIndex((el) => el.id == data.id)
    connection.splice(connectionIdx, 1)
    this.data.list = connection
  }

  @Action({ rawError: true })
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
        port: process.env.TYPEDB_PORT || "8729",
        host: process.env.TYPEDB_HOST || "localhost",
        database: process.env.TYPEDB_DB || "typerefinery",
      }
      await restapi.post(`/datastore/connection`, connection)
      this.context.commit("addGlobalConnection", connection)
    } catch (error) {
      console.log(error)
    }
  }

  @Action({ rawError: true })
  async getInitialConnections() {
    try {
      const res = await restapi.get("/datastore/connection")
      const data = res.data
        .filter((el) => el.scope === "global")
        .map((el) => ({ ...el, id: el.connectionid }))
      this.context.commit("addGlobalConnections", data)
    } catch (err) {
      console.log(err)
    }
  }

  @Action({ rawError: true })
  async setGlobalConnection({ data, connectionIdx }) {
    const connections = this.context.getters["getGlobalConnections"]
    const connection = connections[connectionIdx]
    const payload = { ...connection, ...data }
    try {
      await restapi.put(`/datastore/connection/${data.id}`, payload)
      this.context.commit("updateGlobalConnection", { data, connectionIdx })
    } catch (err) {
      console.log(err)
    }
  }
  @Action({ rawError: true })
  async deleteGlobalConnection(data) {
    const connections = this.context.getters["getGlobalConnections"]
    const connection = connections.find((el) => el.id === data.id)
    const payload = { ...connection, ...data }
    try {
      await restapi.delete(`/datastore/connection/${data.id}`, payload)
      this.context.commit("deleteConnectionGlobally", data)
    } catch (err) {
      console.log(err)
    }
  }
}
