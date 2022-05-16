import * as d3 from "d3"

function renderD3Labels(item, self) {
  const svgEl = item.$refs.graphRef

  if (svgEl.childNodes.length) {
    while (svgEl.hasChildNodes()) {
      svgEl.removeChild(svgEl.firstChild)
    }
  }

  svgEl.classList.remove("webcola-graph")
  svgEl.classList.remove("d3-graph")
  svgEl.classList.add("d3-label-graph")

  let marge = { top: 60, bottom: 60, left: 60, right: 60 }
  let svg = d3.select(svgEl)
  let width = svg.attr("width") || 500
  let height = svg.attr("height") || 400
  let g = svg
    .append("g")
    .attr("transform", "translate(" + marge.top + "," + marge.left + ")")

  // Node Dataset
  let nodes = [
    { name: "Cat" },
    { name: "Dog" },
    { name: "Rabbit" },
    { name: "Bat" },
    { name: "Lion" },
    { name: "Tiger" },
    { name: "Wolf" },
    { name: "Crocodile" },
    { name: "Panda" },
  ]

  // Side Dataset
  let edges = [
    { source: 0, target: 4, relation: "B", value: 1.3 },
    { source: 4, target: 5, relation: "A", value: 1 },
    { source: 4, target: 6, relation: "B", value: 1 },
    { source: 4, target: 7, relation: "A", value: 1 },
    { source: 1, target: 6, relation: "B", value: 2 },
    { source: 2, target: 5, relation: "A", value: 0.9 },
    { source: 3, target: 7, relation: "B", value: 1 },
    { source: 5, target: 6, relation: "A", value: 1.6 },
    { source: 6, target: 7, relation: "B", value: 0.7 },
    { source: 6, target: 8, relation: "A", value: 2 },
  ]

  // Set a color scale
  let colorScale = d3
    .scaleOrdinal()
    .domain(d3.range(nodes.length))
    .range(d3.schemeCategory10)

  // Create a new force guide diagram
  let forceSimulation = d3
    .forceSimulation()
    .force("link", d3.forceLink())
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter())

  // Generate node data
  forceSimulation.nodes(nodes).on("tick", ticked)

  // Generate side data
  forceSimulation
    .force("link")
    .links(edges)
    .distance(function (d) {
      // side length
      return d.value * 100
    })

  // Set drawing center location
  forceSimulation
    .force("center")
    .x(width / 2)
    .y(height / 2)

  // Draw side
  let links = g
    .append("g")
    .selectAll("line")
    .data(edges)
    .enter()
    .append("line")
    .attr("stroke", function (d, i) {
      return colorScale(i)
    })
    .attr("stroke-width", 1)

  // Text on side
  let linksText = g
    .append("g")
    .selectAll("text")
    .data(edges)
    .enter()
    .append("text")
    .text(function (d) {
      return d.relation
    })

  // Create group
  let gs = g
    .selectAll(".circleText")
    .data(nodes)
    .enter()
    .append("g")
    .attr("transform", function (d) {
      let cirX = d.x
      let cirY = d.y
      return "translate(" + cirX + "," + cirY + ")"
    })
    .call(d3.drag().on("start", started).on("drag", dragged).on("end", ended))

  // Draw node
  gs.append("circle")
    .attr("r", 10)
    .attr("fill", function (d, i) {
      return colorScale(i)
    })

  // Draw text
  gs.append("text")
    .attr("x", -10)
    .attr("y", -20)
    .attr("dy", 10)
    .text(function (d) {
      return d.name
    })

  gs.on("click", (e) => {
    console.log(e)
    self.nodeData = {
      label: e.name,
      index: e.index,
    }
  })

  // ticked
  function ticked() {
    links
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
    linksText
      .attr("x", function (d) {
        return (d.source.x + d.target.x) / 2
      })
      .attr("y", function (d) {
        return (d.source.y + d.target.y) / 2
      })
    gs.attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")"
    })
  }
  // drag
  function started(d) {
    if (!d3.event.active) {
      forceSimulation.alphaTarget(0.8).restart() // Set the attenuation coefficient to simulate the node position movement process. The higher the value, the faster the movement. The value range is [0, 1]
    }
    d.fx = d.x
    d.fy = d.y
  }
  function dragged(d) {
    d.fx = d3.event.x
    d.fy = d3.event.y
  }
  function ended(d) {
    if (!d3.event.active) {
      forceSimulation.alphaTarget(0)
    }
    d.fx = null
    d.fy = null
  }
}

export default renderD3Labels
