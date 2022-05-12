import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"
const storeValue = localStorage.getItem("vuex")
const projectsInStore = storeValue ? JSON.parse(storeValue).Projects : false
@Module({
  name: "NewProject",
  store: store,
  dynamic: true,
  preserveState: projectsInStore,
})
export default class Projects extends VuexModule {
  projects = {
    type: "projects",
    list: [
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
              name: "transformer 1",
              title: "Transformer 1",
              icon: "connection",
              description: "",
              type: "transformer",
            },
            {
              name: "transformer 2",
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
      },
    ],
  }
}
