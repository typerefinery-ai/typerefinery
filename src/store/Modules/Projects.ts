import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"
const storeValue = localStorage.getItem("vuex")
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
              logs: [],
            },
          },
          {
            name: "query 2",
            description: "",
            type: "connection",
            connection: "connection1",
            icon: "connection",
            query: "",
            transformer: {
              code: "",
              error: "",
              logs: [],
            },
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
            name: "query 1",
            description: "",
            type: "query",
            connection: "connection 2",
            icon: "connection",
            query: "",
            transformer: {
              code: "",
              error: "",
              logs: [],
            },
          },
          {
            name: "query 2",
            description: "",
            type: "connection",
            connection: "connection1",
            icon: "connection",
            query: "",
            transformer: {
              code: "",
              error: "",
              logs: [],
            },
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
    for (const index in this.list) {
      if (this.list[index].name === l.name) {
        this.list[index].connections.list.push(l.list)
      }
    }
  }
  @Mutation
  addToList(l) {
    this.list.push(l)
  }

  // Transformer Code
  get transformerCode() {
    return (projectId: number, queryId: number) => {
      return this.list[projectId].queries.list[queryId].transformer.code
    }
  }

  get transformerError() {
    return (projectId: number, queryId: number) => {
      return this.list[projectId].queries.list[queryId].transformer.error
    }
  }

  @Mutation
  setCode({ code, projectId, queryId }) {
    this.list[projectId].queries.list[queryId].transformer.code = code
  }

  @Mutation
  setError({ error, projectId, queryId }) {
    this.list[projectId].queries.list[queryId].transformer.error = error
  }

  @Mutation
  setLogs({ log, projectId, queryId }) {
    console.log("setLogs is running")
    let logs: string
    if (typeof log == "object") {
      logs = JSON.stringify(log)
    } else if (typeof log != "string") return
    logs = log
    this.list[projectId].queries.list[queryId].transformer.logs.push(logs)
  }

  @Mutation
  clearLogs({ projectId, queryId }) {
    this.list[projectId].queries.list[queryId].transformer.logs = []
  }

  get consoleMessage() {
    return (projectId: number, queryId: number) => {
      console.log(projectId, queryId)
      let myString = ""
      this.list[projectId].queries.list[queryId].transformer.logs.forEach(
        (el, i) => {
          if (i === 0) myString = JSON.stringify(el)
          else myString = myString + "\n" + JSON.stringify(el)
        }
      )
      return (
        myString +
        "\n" +
        this.list[projectId].queries.list[queryId].transformer.error
      )
    }
  }
}
