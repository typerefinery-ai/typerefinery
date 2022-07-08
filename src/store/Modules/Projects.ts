/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import axios from "axios"
import store from "../index"
import sampleData from "@/data/default.json"
const storeValue = localStorage.getItem("typerefinery")
const appDataInStore = storeValue ? JSON.parse(storeValue).AppData : false
@Module({
  name: "AppData",
  store: store,
  dynamic: true,
  preserveState: appDataInStore,
})
export default class AppData extends VuexModule {
  list: any = sampleData.AppData.list

  /**** Getters ****/
  // Data for Dropdown(List)
  get projectsList() {
    return this.list[0].list.map((el) => {
      return { label: el.label, key: el.id }
    })
  }

  // Actual Data
  get allProjects() {
    return this.list[0].list
  }

  get query() {
    return (projectIdx, queryIdx) => {
      return this.list[0].list[projectIdx].queries.list[queryIdx]
    }
  }

  get connectionsList() {
    return (projectIdx) => {
      return [
        {
          label: "Local",
          code: "local",
          items: this.list[0].list[projectIdx].connections.list.map((el) => {
            return { label: el.label, key: el.id, scope: el.scope }
          }),
        },
        {
          label: "Global",
          code: "global",
          items: this.list[1].list.map((el) => {
            return { label: el.label, key: el.id, scope: el.scope }
          }),
        },
      ]
    }
  }

  get localConnections() {
    return (projectIdx) => {
      return this.list[0].list[projectIdx].connections.list
    }
  }

  get globalConnections() {
    return this.list[1].list
  }

  get transformersList() {
    return (projectIdx) => {
      return [
        {
          label: "Local",
          code: "local",
          items: this.list[0].list[projectIdx].transformers.list.map((el) => {
            return { label: el.label, key: el.id, scope: el.scope }
          }),
        },
        {
          label: "Global",
          code: "global",
          items: this.list[2].list.map((el) => {
            return { label: el.label, key: el.id, scope: el.scope }
          }),
        },
      ]
    }
  }

  get localTransformers() {
    return (projectIdx) => {
      return this.list[0].list[projectIdx].transformers.list
    }
  }

  get globalTransformers() {
    return this.list[2].list
  }

  get algorithmsList() {
    return (projectIdx) => {
      return [
        {
          label: "Local",
          code: "local",
          items: this.list[0].list[projectIdx].algorithms.list.map((el) => {
            return { label: el.label, key: el.id, scope: el.scope }
          }),
        },
        {
          label: "Global",
          code: "global",
          items: this.list[3].list.map((el) => {
            return { label: el.label, key: el.id, scope: el.scope }
          }),
        },
      ]
    }
  }

  get localAlgorithms() {
    return (projectIdx) => {
      return this.list[0].list[projectIdx].algorithms.list
    }
  }

  get globalAlgorithms() {
    return this.list[3].list
  }

  // Query Transformer
  get transformerCode() {
    return (projectIdx: number, queryIdx: number) => {
      return this.list[0].list[projectIdx].queries.list[queryIdx].transformer
        .code
    }
  }

  get transformerError() {
    return (projectIdx: number, queryIdx: number) => {
      return this.list[0].list[projectIdx].queries.list[queryIdx].transformer
        .error
    }
  }

  get transformerConsoleMessage() {
    return (projectIdx: number, queryIdx: number) => {
      let myString = ""
      this.list[0].list[projectIdx].queries.list[
        queryIdx
      ].transformer.logs.forEach((el, i) => {
        if (i === 0) myString = JSON.stringify(el)
        else myString = myString + "\n" + JSON.stringify(el)
      })
      return (
        myString +
        "\n" +
        this.list[0].list[projectIdx].queries.list[queryIdx].transformer.error
      )
    }
  }

  // Query Algorithm
  get algorithmCode() {
    return (projectIdx: number, queryIdx: number) => {
      return this.list[0].list[projectIdx].queries.list[queryIdx].algorithm.code
    }
  }

  /**** Mutations ****/

  @Mutation
  addNewProject(project) {
    this.list[0].list.push(project)
  }

  @Mutation
  addNewQuery(queryData) {
    const { projectIdx, data } = queryData
    this.list[0].list[projectIdx].queries.list.push(data)
  }

  @Mutation
  updateQuery(data) {
    console.log("updating query")
    const { projectIdx, queryIdx, key, value } = data
    const appData = JSON.parse(JSON.stringify(this.list))
    appData[0].list[projectIdx].queries.list[queryIdx][key] = value
    this.list = appData
  }

  @Mutation
  addNewConnection(connectionData) {
    const { projectIdx, data } = connectionData
    if (projectIdx == -1) {
      // save globally
      this.list[1].list.push(data)
    } else {
      // save locally
      this.list[0].list[projectIdx].connections.list.push(data)
    }
  }

  @Mutation
  editConnection(connectionData) {
    const { projectIdx, connectionIdx, data } = connectionData
    const appData = JSON.parse(JSON.stringify(this.list))
    if (projectIdx == -1) {
      // update globally
      appData[1].list[connectionIdx] = data
    } else {
      // update locally
      appData[0].list[projectIdx].connections.list[connectionIdx] = data
    }
    this.list = appData
  }

  @Mutation
  addNewTransformer(transformerData) {
    const { projectIdx, data } = transformerData
    if (projectIdx == -1) {
      // save globally
      this.list[2].list.push(data)
    } else {
      // save locally
      this.list[0].list[projectIdx].transformers.list.push(data)
    }
  }

  @Mutation
  editTransformer(transformerData) {
    const { projectIdx, transformerIdx, data } = transformerData
    const appData = JSON.parse(JSON.stringify(this.list))
    if (projectIdx == -1) {
      // update globally
      appData[2].list[transformerIdx] = data
    } else {
      // update locally
      appData[0].list[projectIdx].transformers.list[transformerIdx] = data
    }
    this.list = appData
  }

  @Mutation
  addNewAlgorithm(algorithmData) {
    const { projectIdx, data } = algorithmData
    if (projectIdx == -1) {
      // save globally
      this.list[3].list.push(data)
    } else {
      // save locally
      this.list[0].list[projectIdx].algorithms.list.push(data)
    }
  }

  @Mutation
  editAlgorithm(algorithmData) {
    const { projectIdx, algorithmIdx, data } = algorithmData
    const appData = JSON.parse(JSON.stringify(this.list))
    if (projectIdx == -1) {
      // update globally
      appData[3].list[algorithmIdx] = data
    } else {
      // update locally
      appData[0].list[projectIdx].algorithms.list[algorithmIdx] = data
    }
    this.list = appData
  }

  @Mutation
  setQueryDataPath({ path, projectIdx, queryIdx }) {
    const appData = JSON.parse(JSON.stringify(this.list))
    appData[0].list[projectIdx].queries.list[
      queryIdx
    ].dataPath = `services/fastapi/${path}`
    this.list = appData
  }

  // Query Transformer
  @Mutation
  setTransformerCode({ code, projectIdx, queryIdx }) {
    const appData = JSON.parse(JSON.stringify(this.list))
    appData[0].list[projectIdx].queries.list[queryIdx].transformer.code = code
    this.list = appData
  }

  @Mutation
  setTransformerError({ error, projectIdx, queryIdx }) {
    const appData = JSON.parse(JSON.stringify(this.list))
    appData[0].list[projectIdx].queries.list[queryIdx].transformer.error = error
    this.list = appData
  }

  @Mutation
  setTransformerLogs({ log, projectIdx, queryIdx }) {
    console.log(log)
    let logs: string
    if (typeof log == "object") {
      logs = JSON.stringify(log)
    } else if (typeof log != "string") return
    logs = log
    const appData = JSON.parse(JSON.stringify(this.list))
    appData[0].list[projectIdx].queries.list[queryIdx].transformer.logs.push(
      logs
    )
    this.list = appData
  }

  @Mutation
  clearTransformerLogs({ projectIdx, queryIdx }) {
    const appData = JSON.parse(JSON.stringify(this.list))
    appData[0].list[projectIdx].queries.list[queryIdx].transformer.logs = []
    this.list = appData
  }

  // Query Algorithm
  @Mutation
  setAlgoCode({ code, projectIdx, queryIdx }) {
    const appData = JSON.parse(JSON.stringify(this.list))
    appData[0].list[projectIdx].queries.list[queryIdx].algorithm.code = code
    this.list = appData
  }

  /* ---------------- Tree Nodes ---------------- */

  treeNodeClicked = false
  treeNodePath = ""
  selectedTreeNodes: { list: string[] } = {
    list: [],
  }

  @Mutation
  toggleTreeNode() {
    this.treeNodeClicked = !this.treeNodeClicked
  }

  @Mutation
  setSelectedTreeNodes(node: { id: string }) {
    const nodes = JSON.parse(JSON.stringify(this.selectedTreeNodes))
    nodes.list.push(node.id)
    nodes[node.id] = node
    this.selectedTreeNodes = nodes
  }

  @Mutation
  removeSelectedTreeNodes(id: string) {
    const nodes = JSON.parse(JSON.stringify(this.selectedTreeNodes))
    const idx = nodes.list.findIndex((el) => el == id)
    nodes.list.splice(idx, 1)
    delete nodes[id]
    this.selectedTreeNodes = nodes
  }

  @Mutation
  setTreeNodePath(nodePath: string) {
    this.treeNodePath = nodePath
  }

  @Mutation
  resetTreeNodePath() {
    this.treeNodePath = ""
  }

  /* ---------------- Dialogs ---------------- */

  queryDialog = false
  connectionDialog = false
  transformerDialog = false
  algorithmDialog = false

  @Mutation
  toggleQueryDialog() {
    this.queryDialog = !this.queryDialog
  }

  @Mutation
  toggleConnectionDialog() {
    this.connectionDialog = !this.connectionDialog
  }

  @Mutation
  toggleTransformerDialog() {
    this.transformerDialog = !this.transformerDialog
  }

  @Mutation
  toggleAlgorithmDialog() {
    this.algorithmDialog = !this.algorithmDialog
  }

  /**** Actions ****/
  @Action
  async runAlgorithm(indexes) {
    try {
      const { projectIdx, queryIdx } = indexes
      const query = this.query(projectIdx, queryIdx)
      const payload = {
        dbhost: query.connection.host,
        dbport: query.connection.port,
        dbdatabase: query.database,
        dbquery: query.query,
        algorithm: query.algorithm.code,
        algorithmrequirements: "argparse\nloguru",
        returnoutput: "log",
      }
      const response = await axios.post(query.endpoint, payload)
      console.log(response, "store")
      const path = response.headers["output"].replace(/\\/g, "/")
      console.log(path)
      const data = { path, projectIdx, queryIdx }
      this.setQueryDataPath(data)
      return { data: response.data, type: "data" }
    } catch (error) {
      console.log(error)
      return { data: error, type: "error" }
    }
  }
}
