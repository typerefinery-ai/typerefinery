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
    this.data.treeNodeClicked = !this.data.treeNodeClicked
  }

  @Mutation
  setSelectedTreeNodes(node: { id: string }) {
    const nodes = JSON.parse(JSON.stringify(this.data.selectedTreeNodes))
    nodes.list[0] = node
    this.data.selectedTreeNodes = nodes
  }

  @Mutation
  removeSelectedTreeNodes() {
    // const nodes = JSON.parse(JSON.stringify(this.data.selectedTreeNodes))
    // const idx = nodes.list.findIndex((el) => el == id)
    // nodes.list.splice(idx, 1)
    // delete nodes[id]
    this.data.selectedTreeNodes = { list: [] }
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
  toggleTransformerDialog() {
    this.data.transformerDialog = !this.data.transformerDialog
  }

  @Mutation
  toggleAlgorithmDialog() {
    this.data.algorithmDialog = !this.data.algorithmDialog
  }
}
