/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "@/axios"
import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import store from "../index"
// import sampleData from "@/data/default.json"

@Module({
  name: "Queries",
  store: store,
  dynamic: true,
  preserveState: localStorage.getItem("queries") !== null,
})
export default class Queries extends VuexModule {
  data: any = { list: [] }

  get getGlobalQueries() {
    return this.data.list
  }

  @Mutation
  addGlobalQueries(queries) {
    this.data.list = queries
  }

  @Mutation
  addGlobalQuery(query) {
    if (query.type === "query") this.data.list.push(query)
  }

  @Mutation
  updateGlobalQuery(query) {
    const { queryIdx, field, value } = query
    const queries = JSON.parse(JSON.stringify(this.data))
    queries.list[queryIdx][field] = value
    this.data = queries
  }

  @Action
  async createInitialQuery() {
    try {
      const query = {
        queryid: "defaultquery",
        id: "defaultquery",
        projectid: null,
        connectionid: "defaultconnection",
        scope: "global",
        icon: "",
        label: "Global Query",
        description: "",
        type: "query",
        query:
          "match $a isa log, has logName 'L1';\n$b isa event, has eventName $c;\n$d (owner: $a, item: $b) isa trace,\nhas traceId $e, has index $f;\noffset 0; limit 10;",
        data: "",
      }
      await axios.post(`/datastore/query`, query)
      this.context.commit("addGlobalQuery", query)
    } catch (error) {
      console.log(error)
      this.context.commit("addGlobalQuery", {})
    }
  }

  @Action
  async getInitialQueries() {
    try {
      const res = await axios.get("/datastore/query")
      const data = res.data
        .filter((el) => el.scope === "global")
        .map((el) => ({ ...el, id: el.queryid }))
      this.context.commit("addGlobalQueries", data)
    } catch (err) {
      console.log(err)
    }
  }

  @Action
  async setGlobalQuery(data) {
    const queries = this.context.getters["getGlobalQueries"]
    const query = queries[data.queryIdx]

    const payload = {
      queryid: query.id,
      id: query.id,
      projectid: null,
      icon: query.icon,
      description: query.description,
      type: query.type,
      label: query.label,
      scope: "global",
      connectionid: query.connectionid,
      query: query.query,
      data: "",
      [data.field]: data.value,
    }
    try {
      await axios.put(`/datastore/query/${data.id}`, payload)
      this.context.commit("updateGlobalQuery", data)
    } catch (err) {
      console.log(err)
    }
  }
}
