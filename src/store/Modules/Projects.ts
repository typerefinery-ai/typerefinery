/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import axios from "axios"
import store from "../index"
import themes from "@/data/theme.json"

@Module({
  name: "Projects",
  store: store,
  dynamic: true,
  preserveState: localStorage.getItem("projects") !== null,
})
export default class Projects extends VuexModule {
  data: any = {
    label: "Projects",
    icon: "",
    selectedNode: {},
    expandedNodes: {},
    list: [],
  }
  /**** Getters ****/
  get getProjects() {
    return this.data.list
  }
  get getProjectLabel() {
    return (projectIdx) => {
      const project = this.data.list.findIndex((el) => el.id == projectIdx)

      return this.data.list[project].label
    }
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

  // get getLocalTransformers() {
  //   return (projectIdx) => {
  //     return this.data.list[projectIdx].transformers.list
  //   }
  // }

  // get getLocalAlgorithms() {
  //   return (projectIdx) => {
  //     return this.data.list[projectIdx].algorithms.list
  //   }
  // }

  // Query Transformer
  // get getTransformerCode() {
  //   return (projectIdx: number, queryIdx: number) => {
  //     return this.data.list[projectIdx].queries.list[queryIdx].transformer.code
  //   }
  // }

  // get getTransformerError() {
  //   return (projectIdx: number, queryIdx: number) => {
  //     return this.data.list[projectIdx].queries.list[queryIdx].transformer.error
  //   }
  // }

  // get getTransformerConsoleMessage() {
  //   return (projectIdx: number, queryIdx: number) => {
  //     let myString = ""
  //     this.data.list[projectIdx].queries.list[
  //       queryIdx
  //     ].transformer.logs.forEach((el, i) => {
  //       if (i === 0) myString = JSON.stringify(el)
  //       else myString = myString + "\n" + JSON.stringify(el)
  //     })
  //     return (
  //       myString +
  //       "\n" +
  //       this.data.list[projectIdx].queries.list[queryIdx].transformer.error
  //     )
  //   }
  // }

  // // Query Algorithm
  // get getAlgorithmCode() {
  //   return (projectIdx: number, queryIdx: number) => {
  //     return this.data.list[projectIdx].queries.list[queryIdx].algorithm.code
  //   }
  // }

  /**** Mutations ****/
  @Mutation
  addInitialProjects(projects) {
    this.data.list = projects
  }

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
  updateProject(data) {
    console.count("update project called")
    const { field, value, id } = data
    const projects = JSON.parse(JSON.stringify(this.data.list)) // console.log('store',projects)
    const projectIdx = this.data.list.findIndex((el) => el.id == id)
    projects[projectIdx][field] = value
    this.data.list = projects
  }

  @Mutation
  updateQuery(data) {
    const { projectIdx, queryIdx, field, value } = data
    const projects = JSON.parse(JSON.stringify(this.data.list))
    projects[projectIdx].queries.list[queryIdx][field] = value
    this.data.list = projects
  }
  @Mutation
  updateTheme(themedata) {
    const { code, parentIdx, selectedtheme } = themedata
    const parseddata = JSON.parse(code)
    const projects = JSON.parse(JSON.stringify(this.data.list))
    projects[parentIdx].themes.list[0].data[selectedtheme.key] = parseddata
    this.data.list = projects
  }
  // get getTheme() {
  //   return (projectIdx) => {
  //     return this.data.list[projectIdx].themes.list[0]
  //   }
  // }
  @Action
  async setThemeData(themeData) {
    const themeDataParsed = JSON.parse(themeData)
    const { code, parentIdx, selectedtheme } = themeDataParsed
    const themesGetters = this.context.getters["getTheme"]
    const themes = themesGetters(parentIdx)
    console.log("apitheme", themes.data)
    const payload = {
      projectid: themeDataParsed.parent,
      scope: "string",
      label: selectedtheme.label,
      type: "string",
      data: "string",
      icon: "string",
      themeid: selectedtheme.label,
      description: "string",
      theme: code,
    }
    try {
      // console.log("paayload", payload)
      await axios.put(
        `http://localhost:8000/datastore/theme/${selectedtheme.label}`,
        payload
      )
      const output = {
        ...themeDataParsed,
        projectIdx: themeDataParsed.parentIdx,
      }
      this.context.commit("updateTheme", output)
    } catch (err) {
      console.log(err)
    }
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

  // @Mutation
  // addLocalTransformer(transformerData) {
  //   const { projectIdx, data } = transformerData
  //   this.data.list[projectIdx].transformers.list.push(data)
  // }

  // @Mutation
  // editLocalTransformer(transformerData) {
  //   const { projectIdx, transformerIdx, data } = transformerData
  //   const projects = JSON.parse(JSON.stringify(this.data.list))
  //   projects[projectIdx].transformers.list[transformerIdx] = data
  //   this.data.list = projects
  // }

  // @Mutation
  // addLocalAlgorithm(algorithmData) {
  //   const { projectIdx, data } = algorithmData
  //   this.data.list[projectIdx].algorithms.list.push(data)
  // }

  // @Mutation
  // editLocalAlgorithm(algorithmData) {
  //   const { projectIdx, algorithmIdx, data } = algorithmData
  //   const projects = JSON.parse(JSON.stringify(this.data.list))
  //   projects[projectIdx].algorithms.list[algorithmIdx] = data
  //   this.data.list = projects
  // }

  @Mutation
  setQueryDataPath({ path, projectIdx, queryIdx }) {
    const projects = JSON.parse(JSON.stringify(this.data.list))
    projects[projectIdx].queries.list[queryIdx].dataPath = path
    this.data.list = projects
  }

  // Query Transformer
  // @Mutation
  // setTransformerCode({ code, projectIdx, queryIdx }) {
  //   const projects = JSON.parse(JSON.stringify(this.data.list))
  //   projects[projectIdx].queries.list[queryIdx].transformer.code = code
  //   this.data.list = projects
  // }

  // @Mutation
  // setTransformerError({ error, projectIdx, queryIdx }) {
  //   const projects = JSON.parse(JSON.stringify(this.data.list))
  //   projects[projectIdx].queries.list[queryIdx].transformer.error = error
  //   this.data.list = projects
  // }

  // @Mutation
  // setTransformerLogs({ log, projectIdx, queryIdx }) {
  //   let logs: string
  //   if (typeof log == "object") {
  //     logs = JSON.stringify(log)
  //   } else if (typeof log != "string") return
  //   logs = log
  //   const projects = JSON.parse(JSON.stringify(this.data.list))
  //   projects[projectIdx].queries.list[queryIdx].transformer.logs.push(logs)
  //   this.data.list = projects
  // }

  // @Mutation
  // clearTransformerLogs({ projectIdx, queryIdx }) {
  //   const projects = JSON.parse(JSON.stringify(this.data.list))
  //   projects[projectIdx].queries.list[queryIdx].transformer.logs = []
  //   this.data.list = projects
  // }

  // // Query Algorithm
  // @Mutation
  // setAlgoCode({ code, projectIdx, queryIdx }) {
  //   const projects = JSON.parse(JSON.stringify(this.data.list))
  //   projects[projectIdx].queries.list[queryIdx].algorithm.code = code
  //   this.data.list = projects
  // }

  /**** Actions ****/
  // @Action
  // async runAlgorithm(indexes) {
  //   try {
  //     const { projectIdx, queryIdx } = indexes
  //     const query = this.getQuery(projectIdx, queryIdx)
  //     const payload = {
  //       dbhost: query.connection.host,
  //       dbport: query.connection.port,
  //       dbdatabase: query.database,
  //       dbquery: query.query,
  //       algorithm: query.algorithm.code,
  //       algorithmrequirements: "argparse\nloguru",
  //       returnoutput: "log",
  //     }
  //     const response = await axios.post(query.endpoint, payload)
  //     const outputExists =
  //       response.headers["output.exists"].toLowerCase() == "true"
  //     let path = ""
  //     if (outputExists) path = response.headers["output.url"]
  //     const data = { path, projectIdx, queryIdx }
  //     this.setQueryDataPath(data)
  //     return { data: response.data, type: "data" }
  //   } catch (error) {
  //     console.log(error)
  //     return { data: error, type: "error" }
  //   }
  // }

  @Action
  async getStoreData() {
    const responses = await axios.all([
      axios.get("http://localhost:8000/datastore/project"),
      axios.get("http://localhost:8000/datastore/connection"),
      axios.get("http://localhost:8000/datastore/query"),
    ])
    const [projects, connections, queries] = responses.map((el) => el.data)
    console.log({ projects, connections, queries })
    const data = projects.map((p) => {
      return {
        type: "project",
        id: p.projectid,
        label: p.name,
        description: p.description,
        icon: p.icon,
        connections: {
          type: "connections",
          icon: "",
          list: connections
            .filter((c) => c.projectid === p.projectid)
            .map((c) => ({ ...c, id: c.connectionid })),
        },
        queries: {
          type: "queries",
          icon: "",
          list: queries
            .filter((q) => q.projectid === p.projectid)
            .map((q) => ({ ...q, id: q.queryid })),
        },
        themes: themes,
        wirings: {
          type: "wirings",
          icon: "",
          list: [
            {
              type: "wiring",
              id: p.flowid,
              label: "Workflow",
              icon: "Workflow",
              scope: "local",
              description: "",
              data: [],
            },
          ],
          outputs: {
            type: "outputs",
            icon: "",
            list: [],
          },
        },
      }
    })
    console.log(data)
    if (data.length) this.context.commit("addInitialProjects", data)
  }

  // Project
  @Action
  async setProjectData(data) {
    const projects = this.context.getters["getProjects"]
    const project = projects.find((el) => el.id === data.id)

    const payload = {
      projectid: project.id,
      icon: project.icon,
      description: project.description,
      data: "",
      flowid: project.wirings.list[0].id,
      name: data.field === "label" ? data.value : project.label,
      [data.field]: data.value,
    }
    try {
      await axios.put(
        `http://localhost:8000/datastore/project/${data.id}`,
        payload
      )
      this.context.commit("updateProject", data)
    } catch (err) {
      console.log(err)
    }
  }

  // Connection
  @Action
  async setConnectionData(data) {
    console.log("hi", data)
    const connectionsGetters = this.context.getters["getLocalConnections"]
    const connections = connectionsGetters(data.parentIdx)

    const connectionIdx = connections.findIndex((el) => el.id === data.id)
    const connection = connections[connectionIdx]

    const payload = {
      projectid: data.parent,
      connectionid: connection.id,
      icon: connection.icon,
      description: connection.description,
      type: "",
      host: connection.host,
      port: connection.port,
      label: connection.label,
      scope: "",
      database: connection.database,
    }
    try {
      await axios.put(
        `http://localhost:8000/datastore/connection/${data.id}`,
        payload
      )
      data = { ...data, connectionIdx, projectIdx: data.parentIdx }
      this.context.commit("updateConnection", data)
    } catch (err) {
      console.log(err)
    }
  }
}
