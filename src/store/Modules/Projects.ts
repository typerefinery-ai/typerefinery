/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import axios from "axios"
import store from "../index"
import sampleData from "@/data/default.json"

@Module({
  name: "Projects",
  store: store,
  dynamic: true,
  preserveState: localStorage.getItem("projects") !== null,
})
export default class Projects extends VuexModule {
  data = sampleData.projects

  /**** Getters ****/
  get getProjects() {
    return this.data.list
  }

  get getQueries() {
    return (projectIdx) => {
      return this.data.list[projectIdx].queries.list
    }
  }

  get getQuery() {
    return (projectIdx, queryIdx) => {
      return this.data.list[projectIdx].queries.list[queryIdx]
    }
  }

  get getLocalConnections() {
    return (projectIdx) => {
      return this.data.list[projectIdx].connections.list
    }
  }

  get getLocalTransformers() {
    return (projectIdx) => {
      return this.data.list[projectIdx].transformers.list
    }
  }

  get getLocalAlgorithms() {
    return (projectIdx) => {
      return this.data.list[projectIdx].algorithms.list
    }
  }

  // Query Transformer
  get getTransformerCode() {
    return (projectIdx: number, queryIdx: number) => {
      return this.data.list[projectIdx].queries.list[queryIdx].transformer.code
    }
  }

  get getTransformerError() {
    return (projectIdx: number, queryIdx: number) => {
      return this.data.list[projectIdx].queries.list[queryIdx].transformer.error
    }
  }

  get getTransformerConsoleMessage() {
    return (projectIdx: number, queryIdx: number) => {
      let myString = ""
      this.data.list[projectIdx].queries.list[
        queryIdx
      ].transformer.logs.forEach((el, i) => {
        if (i === 0) myString = JSON.stringify(el)
        else myString = myString + "\n" + JSON.stringify(el)
      })
      return (
        myString +
        "\n" +
        this.data.list[projectIdx].queries.list[queryIdx].transformer.error
      )
    }
  }

  // Query Algorithm
  get getAlgorithmCode() {
    return (projectIdx: number, queryIdx: number) => {
      return this.data.list[projectIdx].queries.list[queryIdx].algorithm.code
    }
  }

  /**** Mutations ****/
  @Mutation
  addNewProject(project) {
    this.data.list.push(project)
  }

  @Mutation
  updateExpandedNodes({ key, value }) {
    const projects = JSON.parse(JSON.stringify(this.data))
    if (value) {
      projects.expandedNodes[key] = value
    } else {
      delete projects.expandedNodes[key]
    }
    this.data = projects
  }

  @Mutation
  updateSelectedNode({ key, value }) {
    const projects = JSON.parse(JSON.stringify(this.data))
    if (value) {
      projects.selectedNode[key] = value
    } else {
      delete projects.selectedNode[key]
    }
    this.data = projects
  }

  @Mutation
  addNewQuery(queryData) {
    const { projectIdx, data } = queryData
    this.data.list[projectIdx].queries.list.push(data)
  }

  @Mutation
  updateQuery(data) {
    const { projectIdx, queryIdx, key, value } = data
    const projects = JSON.parse(JSON.stringify(this.data.list))
    projects[projectIdx].queries.list[queryIdx][key] = value
    this.data.list = projects
  }

  @Mutation
  updateConnection(data) {
    const { projectIdx, connectionIdx, key, value } = data
    const projects = JSON.parse(JSON.stringify(this.data.list))
    projects[projectIdx].connections.list[connectionIdx][key] = value
    this.data.list = projects
  }

  @Mutation
  addLocalConnection(connectionData) {
    const { projectIdx, data } = connectionData
    this.data.list[projectIdx].connections.list.push(data)
  }

  @Mutation
  editLocalConnection(connectionData) {
    const { projectIdx, connectionIdx, data } = connectionData
    const projects = JSON.parse(JSON.stringify(this.data.list))
    projects[projectIdx].connections.list[connectionIdx] = data
    this.data.list = projects
  }

  @Mutation
  addLocalTransformer(transformerData) {
    const { projectIdx, data } = transformerData
    this.data.list[projectIdx].transformers.list.push(data)
  }

  @Mutation
  editLocalTransformer(transformerData) {
    const { projectIdx, transformerIdx, data } = transformerData
    const projects = JSON.parse(JSON.stringify(this.data.list))
    projects[projectIdx].transformers.list[transformerIdx] = data
    this.data.list = projects
  }

  @Mutation
  addLocalAlgorithm(algorithmData) {
    const { projectIdx, data } = algorithmData
    this.data.list[projectIdx].algorithms.list.push(data)
  }

  @Mutation
  editLocalAlgorithm(algorithmData) {
    const { projectIdx, algorithmIdx, data } = algorithmData
    const projects = JSON.parse(JSON.stringify(this.data.list))
    projects[projectIdx].algorithms.list[algorithmIdx] = data
    this.data.list = projects
  }

  @Mutation
  setQueryDataPath({ path, projectIdx, queryIdx }) {
    const projects = JSON.parse(JSON.stringify(this.data.list))
    projects[projectIdx].queries.list[queryIdx].dataPath = path
    this.data.list = projects
  }

  // Query Transformer
  @Mutation
  setTransformerCode({ code, projectIdx, queryIdx }) {
    const projects = JSON.parse(JSON.stringify(this.data.list))
    projects[projectIdx].queries.list[queryIdx].transformer.code = code
    this.data.list = projects
  }

  @Mutation
  setTransformerError({ error, projectIdx, queryIdx }) {
    const projects = JSON.parse(JSON.stringify(this.data.list))
    projects[projectIdx].queries.list[queryIdx].transformer.error = error
    this.data.list = projects
  }

  @Mutation
  setTransformerLogs({ log, projectIdx, queryIdx }) {
    let logs: string
    if (typeof log == "object") {
      logs = JSON.stringify(log)
    } else if (typeof log != "string") return
    logs = log
    const projects = JSON.parse(JSON.stringify(this.data.list))
    projects[projectIdx].queries.list[queryIdx].transformer.logs.push(logs)
    this.data.list = projects
  }

  @Mutation
  clearTransformerLogs({ projectIdx, queryIdx }) {
    const projects = JSON.parse(JSON.stringify(this.data.list))
    projects[projectIdx].queries.list[queryIdx].transformer.logs = []
    this.data.list = projects
  }

  // Query Algorithm
  @Mutation
  setAlgoCode({ code, projectIdx, queryIdx }) {
    const projects = JSON.parse(JSON.stringify(this.data.list))
    projects[projectIdx].queries.list[queryIdx].algorithm.code = code
    this.data.list = projects
  }

  /**** Actions ****/
  @Action
  async runAlgorithm(indexes) {
    try {
      const { projectIdx, queryIdx } = indexes
      const query = this.getQuery(projectIdx, queryIdx)
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
      const outputExists =
        response.headers["output.exists"].toLowerCase() == "true"
      let path = ""
      if (outputExists) path = response.headers["output.url"]
      const data = { path, projectIdx, queryIdx }
      this.setQueryDataPath(data)
      return { data: response.data, type: "data" }
    } catch (error) {
      console.log(error)
      return { data: error, type: "error" }
    }
  }
}
