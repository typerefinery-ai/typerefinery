import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"

const storeValue = localStorage.getItem("transformer")
const settingsInStore = storeValue ? JSON.parse(storeValue).Transformer : false

@Module({
  name: "Transformer",
  store: store,
  dynamic: true,
  preserveState: settingsInStore,
})
export default class Transformer extends VuexModule {
  code = `var svg = d3.select(wrapper).append("svg"),
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
}`

  @Mutation
  setCode(code: string) {
    this.code = code
  }

  error = ""
  @Mutation
  setError(error: string) {
    this.error = error
  }

  logs: Array<string> = []
  @Mutation
  setLogs(log: string) {
    let logs
    if (typeof log == "object") {
      logs = JSON.stringify(log)
    } else if (typeof log != "string") return
    logs = log
    this.logs.push(logs)
  }
  @Mutation
  clearLogs() {
    this.logs = []
  }

  get consoleMessage() {
    let myString = ""
    this.logs.forEach((el, i) => {
      if (i === 0) myString = JSON.stringify(el)
      else myString = myString + "\n" + JSON.stringify(el)
    })
    return myString + "\n" + this.error
  }
}
