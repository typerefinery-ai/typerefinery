import * as d3 from "d3"
import * as cola from "webcola"
import data from "./webcola1.json"

function renderWebcola(item) {
  const svgEl = item.$refs.graphRef

  if (svgEl.childNodes.length) {
    while (svgEl.hasChildNodes()) {
      svgEl.removeChild(svgEl.firstChild)
    }
  }

  svgEl.classList.remove("d3-graph")
  svgEl.classList.remove("d3-label-graph")
  svgEl.classList.add("webcola-graph")

  const color = d3.scaleOrdinal(d3.schemeCategory10)
  const width = 1000
  const height = 750

  const prepareData = (data) => {
    const { nodes: initialNodes, relationships: initialLinks } = data

    const links = initialLinks.reduce((acc, link) => {
      const source = initialNodes.findIndex((n) => n.id === link.fromNode)
      const target = initialNodes.findIndex((n) => n.id === link.toNode)

      return source !== -1 && target !== -1
        ? [...acc, { ...link, source, target }]
        : acc
    }, [])

    const nodes = initialNodes.map((node) => {
      const label = node.siren
        ? node.name
        : node.firstName[0] + node.lastName[0]

      return {
        ...node,
        label,
        width: Math.max(label.length * 10, 30) + 20,
        height: 40,
      }
    })

    return { nodes, links }
  }

  const { nodes, links } = prepareData(data)

  const graph = cola
    .d3adaptor(d3)
    .linkDistance(70)
    .avoidOverlaps(true)
    .size([width, height])

  const svg = d3.select(item.$refs.graphRef)
  // .attr("width", width)
  // .attr("height", height)

  svg
    .append("defs")
    .append("marker")
    .attr("id", "linkArrow")
    .attr("viewBox", "0 0 8 12")
    .attr("refX", "-60")
    .attr("refY", "6")
    .attr("markerWidth", "4")
    .attr("markerHeight", "6")
    .attr("orient", "auto")
    .attr("overflow", "visible")
    .append("polygon")
    .attr("points", "0,0 8,6 0,12")
    .attr("fill", "white")

  graph.nodes(nodes).links(links).start()

  const node = svg
    .selectAll(".node")
    .data(nodes)
    .enter()
    .append("rect")
    .attr("class", "node")
    .attr("width", (d) => d.width)
    .attr("height", (d) => d.height)
    .attr("rx", 20)
    .attr("ry", 20)
    .style("fill", () => color(1))
    .call(graph.drag)

  const link = svg
    .selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", (d) => `link link--${d.type.toLowerCase()}`)
    .call(graph.drag)

  const label = svg
    .selectAll(".label")
    .data(nodes)
    .enter()
    .append("text")
    .attr("class", "label")
    .text((d) => d.label)
    .call(graph.drag)

  graph.on("tick", function () {
    node
      .attr("x", (d) => d.x - d.width / 2)
      .attr("y", (d) => d.y - d.height / 2)

    link.attr(
      "d",
      ({ source, target }) =>
        `M ${source.x} ${source.y},
           L ${target.x} ${target.y},
           m ${(source.x + target.x) / 2} ${(source.y + target.y) / 2}`
    )

    label
      .attr("x", (d) => d.x)
      .attr("y", function (d) {
        var h = this.getBBox().height
        return d.y + h / 4
      })
  })
}

export default renderWebcola
