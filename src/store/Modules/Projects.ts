import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"
const storeValue = localStorage.getItem("typerefinery")
const projectsInStore = storeValue ? JSON.parse(storeValue).Projects : false
@Module({
  name: "Projects",
  store: store,
  dynamic: true,
  preserveState: projectsInStore,
})
export default class Projects extends VuexModule {
  type = "projects"
  list = [
    {
      type: "project",
      name: "Project 1",
      expanded: true,
      description: "",
      icon: "project",
      connections: {
        type: "connections",
        expanded: true,
        icon: "connection",
        list: [
          {
            name: "connection 1",
            title: "connection 1",
            icon: "connection",
            description: "",
            type: "connection",
          },
          {
            name: "connection 2",
            title: "Connection 2",
            icon: "connection",
            description: "",
            type: "connection",
          },
        ],
      },
      queries: {
        type: "queries",
        expanded: true,
        list: [
          {
            name: "query 1",
            description: "",
            type: "query",
            connection: "connection 2",
            icon: "connection",
            query: "",
            transformer: "transformer 1",
          },
          {
            name: "query 2",
            description: "",
            type: "connection",
            connection: "connection1",
            icon: "connection",
            query: "",
            transformer: "transformer2",
          },
        ],
      },
      transformers: {
        type: "transformers",
        list: [
          {
            name: "Transformer 1",
            title: "Transformer 1",
            icon: "connection",
            description: "",
            type: "transformer",
          },
          {
            name: "Transformer 2",
            title: "Transformer 2",
            icon: "connection",
            description: "",
            type: "transformer",
          },
        ],
      },
    },
    {
      type: "project",
      name: "Project 2",
      expanded: true,
      description: "",
      icon: "project",
      connections: {
        type: "connections",
        expanded: true,
        icon: "connection",
        list: [
          {
            name: "connection 3",
            title: "connection 3",
            icon: "connection",
            description: "",
            type: "connection",
          },
          {
            name: "connection 4",
            title: "Connection 4",
            icon: "connection",
            description: "",
            type: "connection",
          },
        ],
      },
      queries: {
        type: "queries",
        expanded: true,
        list: [
          {
            name: "query 3 ",
            description: "",
            type: "query",
            connection: "connection 2",
            icon: "connection",
            query: "",
            transformer: "transformer 1",
          },
          {
            name: "query 4",
            description: "",
            type: "connection",
            connection: "connection1",
            icon: "connection",
            query: "",
            transformer: "transformer2",
          },
        ],
      },
      transformers: {
        type: "transformers",
        list: [
          {
            name: "Transformer 3",
            title: "Transformer 3",
            icon: "connection",
            description: "",
            type: "transformer",
          },
          {
            name: "Transformer 4",
            title: "Transformer 4",
            icon: "connection",
            description: "",
            type: "transformer",
          },
        ],
      },
    },
  ]
  value: "" | undefined
  get storedata() {
    return this.list
  }
  get projectList() {
    let name = this.list.map((el) => {
      return { name: el.name, key: el.name }
    })
    return name
  }
  get connectionList() {
    for (const index in this.list) {
      if (this.list[index].name === this.value) {
        return this.list[index].connections.list.map((el) => {
          return { name: el.name, key: el.name }
        })
      }
    }
  }
  get transformerList() {
    for (const index in this.list) {
      if (this.list[index].name === this.value) {
        return this.list[index].transformers.list.map((el) => {
          return { name: el.name, key: el.name }
        })
      }
    }
  }
  @Mutation
  selectedProject(l) {
    this.value = l
    console.log(this.value)
  }
  @Mutation
  addNewTransformer(l) {
    for (const index in this.list) {
      if (this.list[index].name === l.name) {
        this.list[index].transformers.list.push(l.list)
      }
    }
  }
  @Mutation
  addNewQuery(l) {
    for (const index in this.list) {
      if (this.list[index].name === l.name) {
        this.list[index].queries.list.push(l.list)
      }
    }
  }
  @Mutation
  addNewConnection(l) {
    for (var index in this.list) {
      if (this.list[index].name === l.name) {
        this.list[index].connections.list.push(l.list)
      }
    }
  }
  @Mutation
  addToList(l) {
    this.list.push(l)
  }
  nodeSelected = false
  @Mutation
  selectNode() {
    this.nodeSelected = !this.nodeSelected
  }
  clickednode = []
  @Mutation
  selectedNode(data) {
    return (this.clickednode = data)
  }
}
