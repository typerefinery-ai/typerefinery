<template>
  <div ref="graph_wrapper" class="graph_wrapper"></div>
</template>

<script>
  import * as d3 from "d3"
  import * as webcola from "webcola"
  import { getModule } from "vuex-module-decorators"
  import FlowMessage from "@/store/Modules/FlowMessage"
  const flowModule = getModule(FlowMessage)
  export default {
    name: "FlowGraph",
    mounted() {
      this.renderGraph()
    },
    methods: {
      renderGraph() {
        var colors = [
          {
            name: "Greys",
            colors: [
              "#f0f0f0",
              "#d9d9d9",
              "#bdbdbd",
              "#969696",
              "#737373",
              "#525252",
              "#252525",
              "#000000",
            ],
          },
          {
            name: "Reds",
            colors: [
              "#fee0d2",
              "#fcbba1",
              "#fc9272",
              "#fb6a4a",
              "#ef3b2c",
              "#cb181d",
              "#a50f15",
              "#67000d",
            ],
          },
          {
            name: "Oranges",
            colors: [
              "#fee6ce",
              "#fdd0a2",
              "#fdae6b",
              "#fd8d3c",
              "#f16913",
              "#d94801",
              "#a63603",
              "#7f2704",
            ],
          },
          {
            name: "Greens",
            colors: [
              "#e5f5e0",
              "#c7e9c0",
              "#a1d99b",
              "#74c476",
              "#41ab5d",
              "#238b45",
              "#006d2c",
              "#00441b",
            ],
          },
          {
            name: "Blues",
            colors: [
              "#deebf7",
              "#c6dbef",
              "#9ecae1",
              "#6baed6",
              "#4292c6",
              "#2171b5",
              "#08519c",
              "#08306b",
            ],
          },
          {
            name: "Purples",
            colors: [
              "#efedf5",
              "#dadaeb",
              "#bcbddc",
              "#9e9ac8",
              "#807dba",
              "#6a51a3",
              "#54278f",
              "#3f007d",
            ],
          },
          {
            name: "Orange-Red",
            colors: [
              "#fee8c8",
              "#fdd49e",
              "#fdbb84",
              "#fc8d59",
              "#ef6548",
              "#d7301f",
              "#b30000",
              "#7f0000",
            ],
          },
          {
            name: "Red-Purples",
            colors: [
              "#fde0dd",
              "#fcc5c0",
              "#fa9fb5",
              "#f768a1",
              "#dd3497",
              "#ae017e",
              "#7a0177",
              "#49006a",
            ],
          },
          {
            name: "Blue-Green",
            colors: [
              "#e5f5f9",
              "#ccece6",
              "#99d8c9",
              "#66c2a4",
              "#41ae76",
              "#238b45",
              "#006d2c",
              "#00441b",
            ],
          },
          {
            name: "Yellows",
            colors: [
              "#fffee5",
              "#fffcbd",
              "#fff98b",
              "#fff533",
              "#eedf00",
              "#dad000",
              "#c0b700",
              "#b0a800",
            ],
          },
        ]

        var theme = {
          attribute: {
            colorlist: "Oranges",
            cindex: 7,
            tcolorlist: "Greys",
            tindex: 0,
          },
          entity: {
            colorlist: "Blues",
            cindex: 7,
            tcolorlist: "Greys",
            tindex: 0,
          },
          relation: {
            colorlist: "Blue-Green",
            cindex: 6,
            tcolorlist: "Greys",
            tindex: 7,
          },
          shadow: {
            colorlist: "Oranges",
            cindex: 2,
            tcolorlist: "Greys",
            tindex: 7,
          },
        }

        var svg = d3
          .select(this.$refs.graph_wrapper)
          .append("svg")
          .call(
            d3.zoom().on("zoom", function () {
              svg.attr("transform", d3.event.transform)
            })
          )
          .append("g")

        const height =
          +d3.select(this.$refs.graph_wrapper).attr("height") || 500
        const width = +d3.select(this.$refs.graph_wrapper).attr("width") || 400

        // setup the theme color

        const textPadding = 8
        const corner = 5
        const grp_corner = 8
        const pad = 5
        var ent_colour = "#03396c"
        var ent_t_colour = "white"
        var att_colour = "#ff4d00"
        var att_t_colour = "white"
        var shad_colour = "#ff4d00"
        var shad_t_colour = "white"
        var rel_colour = "#007777"
        var rel_t_colour = "black"

        let colours = colors
        // load the colours from the theme
        ent_colour = colors.find(
          (colour) => colour.name == theme.entity.colorlist
        )["colors"][theme.entity.cindex]
        ent_t_colour = colors.find(
          (colour) => colour.name == theme.entity.tcolorlist
        )["colors"][theme.entity.tindex]
        att_colour = colors.find(
          (colour) => colour.name == theme.attribute.colorlist
        )["colors"][theme.attribute.cindex]
        att_t_colour = colors.find(
          (colour) => colour.name == theme.attribute.tcolorlist
        )["colors"][theme.attribute.tindex]
        shad_colour = colors.find(
          (colour) => colour.name == theme.shadow.colorlist
        )["colors"][theme.shadow.cindex]
        shad_t_colour = colors.find(
          (colour) => colour.name == theme.shadow.tcolorlist
        )["colors"][theme.shadow.tindex]
        rel_colour = colors.find(
          (colour) => colour.name == theme.relation.colorlist
        )["colors"][theme.relation.cindex]
        rel_t_colour = colors.find(
          (colour) => colour.name == theme.relation.tcolorlist
        )["colors"][theme.relation.tindex]

        let cola = webcola.d3adaptor(d3).size([width, height])

        // graph.json
        const data = flowModule.data.basic
        cola
          .nodes(data.nodes)
          .links(data.links)
          .groups(data.groups)
          .linkDistance(100)
          .avoidOverlaps(true)
          .handleDisconnected(false)
          .start(30)

        var group = svg
          .selectAll(".group")
          .data(data.groups)
          .enter()
          .append("rect")
          .attr("rx", grp_corner)
          .attr("ry", grp_corner)
          .attr("class", "group")
          .style("fill", function (d, i) {
            return colours.find(
              (colour) => colour.name == d.colour_list
            )["colors"][d.level]
          })
          .attr("stroke-width", 1)
          .attr("stroke", function (d, i) {
            return colours.find(
              (colour) => colour.name == d.colour_list
            )["colors"][7]
          })
          .call(cola.drag)

        group.append("title").text(function (d) {
          return d.label
        })

        var link = svg
          .selectAll(".link")
          .data(data.links)
          .enter()
          .append("line")
          .attr("class", "link")
          .style("stroke-width", "1px")
          .attr("stroke", "black")

        var node = svg
          .selectAll(".node")
          .data(data.nodes)
          .enter()
          .append("rect")
          .attr("class", "node")
          .attr("class", (d) => d.type)
          .attr("class", (d) => d.G_name)
          .attr("id", (d) => d.G_id)

        var label = svg
          .selectAll(".label")
          .data(data.nodes)
          .enter()
          .append("text")
          .attr("class", "label")
          .text((d) =>
            d.type == "attribute"
              ? d.G_name + ": " + d.value
              : d.G_name + ": " + d.G_id
          )
          .attr("id", (d) => "heading-" + d.G_id)
          .style("font-size", 10)
          .style("text-anchor", "middle")
          .style("color", (d) => text_colour(d))
          .style("fill", (d) => text_colour(d))
          .style("pointer-events", "none")
          .call(cola.drag)

        // setup heading colours for attribute, entity and relation
        function text_colour(d) {
          let colour = "black"
          switch (d.type) {
            case "attribute":
              if (d.dtype == "actual") {
                colour = att_t_colour
              } else {
                colour = shad_t_colour
              }
              break
            case "entity":
              colour = ent_t_colour
              break
            case "relation":
              colour = rel_t_colour
              break
            default:
              colour = "black"
              break
          }
          return colour
        }

        node
          .attr("width", (d) => nodeWidth(d))
          .attr("height", (d) => d.height)
          .attr("rx", (d) => d.corner)
          .attr("ry", (d) => d.corner)
          .attr("x", (d) => d.x)
          .attr("y", (d) => d.y)
          .attr("class", (d) => d.G_name)
          .style("fill", (d) => d.colour)
          .on("click", function (d) {
            d.fixed = true
          })
          .call(cola.drag)

        // function to set dimensions and colours for shapes
        function nodeWidth(d) {
          let headingid = "#heading-" + d.G_id
          let headingbbox = d3.select(headingid).node().getBBox()

          d.width = d3.max([5, headingbbox.width]) + textPadding * 2
          d.height = headingbbox.height + textPadding * 2

          // attributes and entities rounded rectangle, relation is circle
          switch (d.type) {
            case "attribute":
              d.corner = corner
              d.colour = att_colour
              d.x = headingbbox.x - textPadding
              d.y = headingbbox.y - textPadding
              if (d.dtype === "shadow") {
                d.colour = shad_colour
              } else {
                d.colour = att_colour
              }
              break

            case "entity":
              d.corner = corner
              d.colour = ent_colour
              d.x = headingbbox.x - textPadding
              d.y = headingbbox.y - textPadding
              break

            case "relation":
              d.width = 16
              d.height = 16
              d.corner = 8
              d.colour = rel_colour
              d.x = headingbbox.x + headingbbox.width / 2 - d.width / 2
              d.y = headingbbox.y + d.height / 2
              break

            default:
              break
          }
          return d.width
        }

        cola.on("tick", function () {
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
            .attr("x", function (d) {
              return d.x - d.width / 2
            })
            .attr("y", function (d) {
              return d.y - d.height / 2
            })

          group
            .attr("x", function (d) {
              return d.bounds.x - pad
            })
            .attr("y", function (d) {
              return d.bounds.y - pad
            })
            .attr("width", function (d) {
              return d.bounds.width() + 2 * pad
            })
            .attr("height", function (d) {
              return d.bounds.height() + 2 * pad
            })

          label
            .attr("x", function (d) {
              return d.x
            })
            .attr("y", function (d) {
              var h = this.getBBox().height
              return d.y + h / 4
            })
        })
      },
    },
  }
</script>

<style lang="scss">
  .graph_wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    svg {
      width: 100%;
      height: 100%;
    }
  }
</style>
