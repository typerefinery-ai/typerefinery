//////////////////////////////////////////////
// body start                               //
//////////////////////////////////////////////

var d3 = require("d3");

var body = d3.select(document).select("body");

var width = 300;
var height = 300;
var svg = body.append("svg")
    .attr("width", width)
    .attr("height", height);
svg.append("line")
    .attr("x1", 100)
    .attr("y1", 100)
    .attr("x2", 200)
    .attr("y2", 200)
    .style("stroke", "rgb(255,0,0)")
    .style("stroke-width", 2);

//////////////////////////////////////////////
// body end                                 //
//////////////////////////////////////////////

