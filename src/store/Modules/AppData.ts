import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"
import sampleData from "@/data/default.json"

@Module({
  name: "AppData",
  store: store,
  dynamic: true,
  preserveState: localStorage.getItem("appData") !== null,
})
export default class AppData extends VuexModule {
  data = sampleData.appData

  /* ---------------- Tree Nodes ---------------- */

  @Mutation
  toggleTreeNode() {
    const value = !this.data.treeNodeClicked
    this.data.treeNodeClicked = value
  }

  @Mutation
  toggleSplitNode() {
    const value = !this.data.splitNodeClicked
    this.data.splitNodeClicked = value
  }

  @Mutation
  setSelectedTreeNodes(node: { id: string }) {
    const data = JSON.parse(JSON.stringify(this.data))
    const nodes = data.selectedTreeNodes
    if (!nodes.list.includes(node.id)) {
      nodes.list.push(node.id)
      nodes[node.id] = node
      nodes.activeNode = node.id
      this.data.selectedTreeNodes = nodes
    }
  }

  @Mutation
  setActiveTreeNode(id: string) {
    const data = JSON.parse(JSON.stringify(this.data))
    const nodes = data.selectedTreeNodes
    nodes.activeNode = id
    this.data.selectedTreeNodes = nodes
  }

  @Mutation
  setSelectedSplitNodes(node: { id: string }) {
    const data = JSON.parse(JSON.stringify(this.data))
    const nodes = data.selectedSplitNodes
    if (!nodes.list.includes(node.id)) {
      nodes.list.push(node.id)
      nodes[node.id] = node
      this.data.selectedSplitNodes = nodes
    }
  }

  @Mutation
  setActiveSplitNode(id: string) {
    const data = JSON.parse(JSON.stringify(this.data))
    const nodes = data.selectedSplitNodes
    nodes.activeNode = id
    this.data.selectedSplitNodes = nodes
  }

  @Mutation
  removeSelectedTreeNodes(ids: string[]) {
    const nodes = JSON.parse(JSON.stringify(this.data.selectedTreeNodes))
    ids.forEach((id) => {
      const idx = nodes.list.findIndex((el) => el == id)
      if (idx !== -1) {
        nodes.list.splice(idx, 1)
        delete nodes[id]
      }
    })
    if (nodes.list.length) {
      nodes.activeNode = nodes.list[0]
    }
    this.data.selectedTreeNodes = nodes
  }

  @Mutation
  removeSelectedSplitNodes(id: string) {
    const nodes = JSON.parse(JSON.stringify(this.data.selectedSplitNodes))
    const idx = nodes.list.findIndex((el) => el == id)
    nodes.list.splice(idx, 1)
    delete nodes[id]
    if (nodes.list.length) {
      nodes.activeNode = nodes.list[0]
    }
    this.data.selectedSplitNodes = nodes
  }

  @Mutation
  setTreeNodePath(nodePath: string) {
    this.data.treeNodePath = nodePath
  }

  @Mutation
  resetTreeNodePath() {
    this.data.treeNodePath = ""
  }

  /* ---------------- Dialogs ---------------- */

  @Mutation
  toggleQueryDialog() {
    this.data.queryDialog = !this.data.queryDialog
  }

  @Mutation
  toggleConnectionDialog() {
    this.data.connectionDialog = !this.data.connectionDialog
  }

  @Mutation
  toggleThemeDialog() {
    this.data.themeDialog = !this.data.themeDialog
  }
  @Mutation
  toggleTransformerDialog() {
    this.data.transformerDialog = !this.data.transformerDialog
  }

  @Mutation
  toggleAlgorithmDialog() {
    this.data.algorithmDialog = !this.data.algorithmDialog
  }

  // Flow
  @Mutation
  setResizingFlow(value: boolean) {
    this.data.resizingFlow = value
  }

  // Sidebar
  @Mutation
  toggleSidebarPanel() {
    this.data.sidebarVisible = !this.data.sidebarVisible
  }

  // Initial Data
  @Mutation
  setInitialDataCreated() {
    this.data.initialDataCreated = true
  }

  // services
  @Mutation
  setServicesStarted() {
    this.data.servicesStarted = true
  }

  @Mutation
  setServicesStopped() {
    this.data.servicesStarted = false
  }
}
