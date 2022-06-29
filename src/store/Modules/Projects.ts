/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"
const storeValue = localStorage.getItem("typerefinery")
const appDataInStore = storeValue ? JSON.parse(storeValue).AppData : false
@Module({
  name: "AppData",
  store: store,
  dynamic: true,
  preserveState: appDataInStore,
})
export default class AppData extends VuexModule {
  list: any = [
    {
      type: "projects",
      label: "Projects",
      icon: "",
      expanded: false,
      list: [
        {
          type: "project",
          id: "project1",
          label: "Project 1",
          description: "",
          icon: "",
          expanded: false,
          connections: {
            type: "connections",
            icon: "",
            expanded: true,
            list: [
              {
                type: "connection",
                id: "connection1",
                label: "connection 1",
                icon: "connection",
                description: "",
                port: "",
                host: "",
              },
            ],
          },
          queries: {
            type: "queries",
            icon: "",
            expanded: true,
            list: [
              {
                type: "query",
                id: "query1",
                label: "query 1",
                icon: "query",
                description: "",
                query: "",
                connection: "connection1", // id
                transformer: {
                  type: "transformer",
                  id: "transformer1",
                  label: "local transformer 1",
                  icon: "transformer",
                  scope: "local",
                  description: "",
                  code: "",
                  error: "",
                  logs: [""],
                },
                algorithm: {
                  type: "algorithm",
                  id: "algorithm1",
                  label: "algorithm 1",
                  icon: "algorithm",
                  scope: "local",
                  description: "",
                  code: "",
                  error: "",
                  logs: [""],
                },
              },
              {
                type: "query",
                id: "query2",
                label: "query 2",
                icon: "query",
                description: "",
                query: "",
                connection: "connection1", // id
                transformer: {
                  type: "transformer",
                  id: "transformer2",
                  label: "local transformer 2",
                  icon: "transformer",
                  scope: "local",
                  description: "",
                  code: "",
                  error: "",
                  logs: [""],
                },
                algorithm: {
                  type: "algorithm",
                  id: "algorithm1",
                  label: "algorithm 1",
                  icon: "algorithm",
                  scope: "local",
                  description: "",
                  code: "",
                  error: "",
                  logs: [""],
                },
              },
            ],
          },
          transformers: {
            type: "tranformers",
            icon: "",
            expanded: true,
            list: [
              {
                type: "transformer",
                id: "transformer1",
                label: "local transformer 1",
                icon: "transformer",
                scope: "local",
                description: "",
                code: "",
                error: "",
                logs: [""],
              },
              {
                type: "transformer",
                id: "transformer2",
                label: "local transformer 2",
                icon: "transformer",
                scope: "local",
                description: "",
                code: "",
                error: "",
                logs: [""],
              },
            ],
          },
          algorithms: {
            type: "algorithms",
            icon: "",
            expanded: true,
            list: [
              {
                type: "algorithm",
                id: "algorithm1",
                label: "algorithm 1",
                icon: "algorithm",
                scope: "local",
                description: "",
                code: "",
                error: "",
                logs: [""],
              },
              {
                type: "algorithm",
                id: "algorithm2",
                label: "algorithm 2",
                icon: "algorithm",
                scope: "local",
                description: "",
                code: "",
                error: "",
                logs: [""],
              },
            ],
          },
        },
        {
          type: "project",
          id: "project2",
          label: "Project 2",
          description: "",
          icon: "",
          expanded: false,
          connections: {
            icon: "",
            expanded: true,
            list: [
              {
                type: "connection",
                id: "connection1",
                label: "connection 1",
                icon: "connection",
                description: "",
                port: "",
                host: "",
              },
              {
                type: "connection",
                id: "connection2",
                label: "connection 2",
                icon: "connection",
                description: "",
                port: "",
                host: "",
              },
            ],
          },
          queries: {
            icon: "",
            expanded: true,
            list: [
              {
                type: "query",
                id: "query1",
                label: "query 1",
                icon: "query",
                description: "",
                query: "",
                connection: "connection1", // id
                transformer: {
                  type: "transformer",
                  id: "transformer1",
                  label: "local transformer 1",
                  icon: "transformer",
                  scope: "local",
                  description: "",
                  code: "",
                  error: "",
                  logs: [""],
                },
                algorithm: {
                  type: "algorithm",
                  id: "algorithm2",
                  label: "algorithm 2",
                  icon: "algorithm",
                  scope: "local",
                  description: "",
                  code: "",
                  error: "",
                  logs: [""],
                },
              },
              {
                type: "query",
                id: "query2",
                label: "query 2",
                icon: "query",
                description: "",
                query: "",
                connection: "connection1", // id
                transformer: {
                  type: "transformer",
                  id: "transformer2",
                  label: "local transformer 2",
                  icon: "transformer",
                  scope: "local",
                  description: "",
                  code: "",
                  error: "",
                  logs: [""],
                },
                algorithm: {
                  type: "algorithm",
                  id: "algorithm2",
                  label: "algorithm 2",
                  icon: "algorithm",
                  scope: "local",
                  description: "",
                  code: "",
                  error: "",
                  logs: [""],
                },
              },
            ],
          },
          transformers: {
            icon: "",
            expanded: true,
            list: [
              {
                type: "transformer",
                id: "transformer1",
                label: "transformer 1",
                icon: "transformer",
                scope: "local",
                description: "",
                code: "",
                error: "",
                logs: [""],
              },
              {
                type: "transformer",
                id: "transformer2",
                label: "transformer 2",
                icon: "transformer",
                scope: "local",
                description: "",
                code: "",
                error: "",
                logs: [""],
              },
            ],
          },
          algorithms: {
            icon: "",
            expanded: true,
            list: [
              {
                type: "algorithm",
                id: "algorithm1",
                label: "algorithm 1",
                icon: "algorithm",
                description: "",
                code: "",
                error: "",
                logs: [""],
              },
              {
                type: "algorithm",
                id: "algorithm2",
                label: "algorithm 2",
                icon: "algorithm",
                description: "",
                code: "",
                error: "",
                logs: [""],
              },
            ],
          },
        },
      ],
    },
    {
      type: "connections",
      label: "Connections",
      icon: "",
      expanded: false,
      list: [
        {
          type: "connection",
          id: "connection1",
          label: "connection 1",
          icon: "connection",
          description: "",
          port: "",
          host: "",
        },
        {
          type: "connection",
          id: "connection2",
          label: "connection 2",
          icon: "connection",
          description: "",
          port: "",
          host: "",
        },
      ],
    },
    {
      type: "tranformers",
      label: "Tranformers",
      icon: "",
      expanded: false,
      list: [
        {
          type: "transformer",
          id: "transformer1",
          label: "transformer 1",
          icon: "transformer",
          scope: "global",
          description: "",
          code: "",
          error: "",
          logs: [""],
        },
        {
          type: "transformer",
          id: "transformer2",
          label: "transformer 2",
          icon: "transformer",
          scope: "global",
          description: "",
          code: "",
          error: "",
          logs: [""],
        },
      ],
    },
    {
      type: "algorithms",
      label: "Algorithms",
      icon: "",
      expanded: false,
      list: [
        {
          type: "algorithm",
          id: "algorithm1",
          label: "algorithm 1",
          icon: "algorithm",
          scope: "global",
          description: "",
          code: "algorithm 1",
          error: "",
          logs: [""],
        },
        {
          type: "algorithm",
          id: "algorithm2",
          label: "algorithm 2",
          icon: "algorithm",
          scope: "global",
          description: "",
          code: "algorithm 2",
          error: "",
          logs: [""],
        },
      ],
    },
  ]

  /**** Getters ****/
  get projectsList() {
    return this.list[0].list.map((el) => {
      return { label: el.label, key: el.id }
    })
  }

  get connectionsList() {
    return (projectIdx) => {
      return [
        {
          label: "Local",
          code: "local",
          items: this.list[0].list[projectIdx].connections.list.map((el) => {
            return { label: el.label, key: el.id }
          }),
        },
        {
          label: "Global",
          code: "global",
          items: this.list[1].list.map((el) => {
            return { label: el.label, key: el.id }
          }),
        },
      ]
    }
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
  addNewQuery(queryData) {
    const { projectIdx, data } = queryData
    this.list[0].list[projectIdx].queries.list.push(data)
  }

  @Mutation
  updateQuery(data) {
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
}
