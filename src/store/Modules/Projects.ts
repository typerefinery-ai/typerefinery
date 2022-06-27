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
      id: "project1",
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
            id: "connection1",
            name: "connection 1",
            icon: "connection",
            description: "",
            type: "connection",
          },
          {
            id: "connection2",
            name: "connection 2",
            icon: "connection",
            description: "",
            type: "connection",
          },
        ],
      },
      queries: {
        type: "queries",
        expanded: true,
        icon: "query",
        list: [
          {
            id: "query1",
            name: "query 1",
            icon: "query",
            description: "",
            type: "query",
            connection: "connection2", // connection id
            query: "",
            transformerName: "",
            transformer: {
              code: `var svg = d3.select(wrapper).append("svg"),
  width = +svg.attr("width") || 960,
  height = +svg.attr("height") || 500

svg.attr("width", width).attr("height", height)

var color = d3.scaleOrdinal(d3.schemeCategory20)

var simulation = d3
  .forceSimulation()
  .force(
	"link",
	d3.forceLink().id(function (d) {
	  return d.label
	})
  )
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width / 2, height / 2))

d3.json(
  "/src/components/Transformer/D3/miserables.json",
  function (error, graph) {
	if (error) throw error
	var link = svg
	  .append("g")
	  .attr("class", "links")
	  .selectAll("line")
	  .data(graph.links)
	  .enter()
	  .append("line")
	  .attr("stroke-width", function (d) {
		return Math.sqrt(d.value)
	  })
	  .attr("stroke", "#999")

	var node = svg
	  .append("g")
	  .attr("class", "nodes")
	  .selectAll("circle")
	  .data(graph.nodes)
	  .enter()
	  .append("circle")
	  .attr("r", 5)
	  .attr("fill", function (d) {
		return color(d.group)
	  })
	  .call(
		d3
		  .drag()
		  .on("start", dragstarted)
		  .on("drag", dragged)
		  .on("end", dragended)
	  )

	node.append("title").text(function (d) {
	  return d.label
	})

	node.on("click", (e) => {
	  self.nodeData = {
		label: e.label,
		index: e.index,
	  }
	})

	simulation.nodes(graph.nodes).on("tick", ticked)

	simulation.force("link").links(graph.links)

	function ticked() {
	  link
		.attr("x1", function (d) {
		  return d.source.x
		})
		.attr("y1", function (d) {
		  return d.source.y
		})
		.attr("x2", function (d) {
		  return d.target.x
		})
		.attr("y2", function (d) {
		  return d.target.y
		})

	  node
		.attr("cx", function (d) {
		  return d.x
		})
		.attr("cy", function (d) {
		  return d.y
		})
	}
  }
)

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart()
  d.fx = d.x
  d.fy = d.y
}

function dragged(d) {
  d.fx = d3.event.x
  d.fy = d3.event.y
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0)
  d.fx = null
  d.fy = null
}`,
              error: "",
              logs: [""],
            },
            algorithm: {
              code: "",
              error: "",
              logs: [""],
            },
          },
          {
            id: "query2",
            name: "query 2",
            icon: "query",
            description: "",
            type: "query",
            connection: "connection1", // connection id
            query: "",
            transformerName: "",
            transformer: {
              code: "",
              error: "",
              logs: [""],
            },
            algorithm: {
              code: "",
              error: "",
              logs: [""],
            },
          },
        ],
      },
      transformers: {
        type: "transformers",
        list: [
          {
            id: "transformer1",
            name: "Transformer 1",
            icon: "connection",
            description: "",
            type: "transformer",
          },
          {
            id: "transformer2",
            name: "Transformer 2",
            icon: "connection",
            description: "",
            type: "transformer",
          },
        ],
      },
    },
    {
      type: "project",
      id: "project2",
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
            id: "connection3",
            name: "connection 3",
            icon: "connection",
            description: "",
            type: "connection",
          },
          {
            id: "connection4",
            name: "connection 4",
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
            id: "query3",
            name: "query 3",
            icon: "query",
            description: "",
            type: "query",
            connection: "connection3", // connection id
            query: "",
            transformerName: "",
            transformer: {
              code: "",
              error: "",
              logs: [""],
            },
            algorithm: {
              code: "",
              error: "",
              logs: [""],
            },
          },
          {
            id: "query4",
            name: "query 4",
            icon: "query",
            description: "",
            type: "query",
            connection: "connection4", // connection id
            query: "",
            transformerName: "",
            transformer: {
              code: "",
              error: "",
              logs: [],
            },
            algorithm: {
              code: "",
              error: "",
              logs: [""],
            },
          },
        ],
      },
      transformers: {
        type: "transformers",
        list: [
          {
            id: "transformer3",
            name: "Transformer 3",
            icon: "connection",
            description: "",
            type: "transformer",
          },
          {
            id: "transformer4",
            name: "Transformer 4",
            icon: "connection",
            description: "",
            type: "transformer",
          },
        ],
      },
    },
  ]

  @Mutation
  updateQuery(data) {
    const { projectIdx, queryIdx, key, value } = data
    const project = JSON.parse(JSON.stringify(this.list))
    project[projectIdx].queries.list[queryIdx][key] = value
    this.list = project
  }

  get transformersList() {
    return (projectIdx) => {
      return this.list[projectIdx].transformers.list.map((el) => ({
        name: el.name,
        key: el.name,
      }))
    }
  }

  value: "" | undefined
  get storedata() {
    return this.list
  }
  get projectList() {
    const name = this.list.map((el) => {
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
  }
  @Mutation
  addNewTransformer(transformerdata: { projectid: any; list: any }) {
    const { projectid, list } = transformerdata
    this.list[projectid].transformers.list.push(list)
  }
  @Mutation
  editTransformer(el) {
    const { projectId, transformerId } = el
    this.list[projectId].transformers.list[transformerId] = el.list
  }

  @Mutation
  addNewQuery(querydata) {
    const { projectid, list } = querydata
    this.list[projectid].queries.list.push(list)
  }
  @Mutation
  addNewConnection(connectiondata: { projectid: any; list: any }) {
    const { projectid, list } = connectiondata

    this.list[projectid].connections.list.push(list)
  }
  @Mutation
  editConnection(el) {
    const { projectId, connectionId } = el
    this.list[projectId].connections.list[connectionId] = el.list
  }
  @Mutation
  addToList(l) {
    this.list.push(l)
  }

  nodeSelected = false
  @Mutation
  toggleNodeSelection() {
    this.nodeSelected = !this.nodeSelected
  }

  selectedNodes: { list: string[] } = {
    list: [],
  }
  @Mutation
  setSelectedNodes(node: { id: string }) {
    const nodes = JSON.parse(JSON.stringify(this.selectedNodes))
    nodes.list.push(node.id)
    nodes[node.id] = node
    this.selectedNodes = nodes
  }
  @Mutation
  removeSelectedNodes(id: string) {
    const nodes = JSON.parse(JSON.stringify(this.selectedNodes))
    const idx = nodes.list.findIndex((el) => el == id)
    nodes.list.splice(idx, 1)
    delete nodes[id]
    this.selectedNodes = nodes
  }
  //  for editing nodes
  editNode = ""
  @Mutation
  setEditNode(nodePath: string) {
    this.editNode = nodePath
  }

  @Mutation
  reseteditNode() {
    this.editNode = ""
  }
  // Dialogs
  connectionDialog = false
  @Mutation
  toggleConnectionDialog() {
    this.connectionDialog = !this.connectionDialog
  }
  transformerDialog = false
  @Mutation
  toggleTransformerDialog() {
    this.transformerDialog = !this.transformerDialog
  }
  queryDialog = false
  @Mutation
  toggleQueryDialog() {
    this.queryDialog = !this.queryDialog
  }

  // Transformer Code
  get transformerCode() {
    return (projectIdx: number, queryIdx: number) => {
      return this.list[projectIdx].queries.list[queryIdx].transformer.code
    }
  }

  get transformerError() {
    return (projectIdx: number, queryIdx: number) => {
      return this.list[projectIdx].queries.list[queryIdx].transformer.error
    }
  }

  @Mutation
  setCode({ code, projectIdx, queryIdx }) {
    this.list[projectIdx].queries.list[queryIdx].transformer.code = code
  }

  @Mutation
  setError({ error, projectIdx, queryIdx }) {
    this.list[projectIdx].queries.list[queryIdx].transformer.error = error
  }

  @Mutation
  setLogs({ log, projectIdx, queryIdx }) {
    let logs: string
    if (typeof log == "object") {
      logs = JSON.stringify(log)
    } else if (typeof log != "string") return
    logs = log
    this.list[projectIdx].queries.list[queryIdx].transformer.logs.push(logs)
  }

  @Mutation
  clearLogs({ projectIdx, queryIdx }) {
    this.list[projectIdx].queries.list[queryIdx].transformer.logs = []
  }

  get consoleMessage() {
    return (projectIdx: number, queryIdx: number) => {
      let myString = ""
      this.list[projectIdx].queries.list[queryIdx].transformer.logs.forEach(
        (el, i) => {
          if (i === 0) myString = JSON.stringify(el)
          else myString = myString + "\n" + JSON.stringify(el)
        }
      )
      return (
        myString +
        "\n" +
        this.list[projectIdx].queries.list[queryIdx].transformer.error
      )
    }
  }

  //   Algorithm Code
  get algorithmCode() {
    return (projectIdx: number, queryIdx: number) => {
      return this.list[projectIdx].queries.list[queryIdx].algorithm.code
    }
  }

  @Mutation
  setAlgoCode({ code, projectIdx, queryIdx }) {
    this.list[projectIdx].queries.list[queryIdx].algorithm.code = code
  }
}
