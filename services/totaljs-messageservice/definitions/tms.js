NEWPUBLISH("connections_insert", "Connections")
NEWPUBLISH("connections_update", "Connections")
NEWPUBLISH("connections_remove", "Connections")

NEWPUBLISH("svg_insert", "Svg")
NEWPUBLISH("svg_update", "Svg")
NEWPUBLISH("svg_remove", "Svg")

NEWSUBSCRIBE("connections_insert", "Connections")
NEWSUBSCRIBE("connections_update", "Connections")
NEWSUBSCRIBE("connections_remove", "Connections")

NEWSUBSCRIBE("svg_insert", "Svg")
NEWSUBSCRIBE("svg_update", "Svg")
NEWSUBSCRIBE("svg_remove", "Svg")

SUBSCRIBE("connections_insert", function (model) {
  console.log("inserting", model)
  EXEC("+Connections --> insert", model, NOOP)
})

SUBSCRIBE("svg_insert", function (model) {
  console.log(model, "inserting")
  EXEC("+Svg --> insert", model, NOOP)
})

SUBSCRIBE("connections_update", function (model) {
  var controller = EXEC("+Connections --> update", model, NOOP)

  // Set $.id param to EXEC call - https://docs.totaljs.com/total4/407ff001jy51c/#485dc001cl51c
  controller.id = model.id
})

SUBSCRIBE("svg_update", function (model) {
  var controller = EXEC("+Svg --> update", model, NOOP)

  // Set $.id param to EXEC call - https://docs.totaljs.com/total4/407ff001jy51c/#485dc001cl51c
  controller.id = model.id
})

SUBSCRIBE("connections_remove", function (model) {
  var controller = EXEC("+Connections --> remove", null, NOOP)

  // Set $.id param to EXEC call - https://docs.totaljs.com/total4/407ff001jy51c/#485dc001cl51c
  controller.id = model.id
})

SUBSCRIBE("svg_remove", function (model) {
  var controller = EXEC("+Svg --> remove", null, NOOP)

  // Set $.id param to EXEC call - https://docs.totaljs.com/total4/407ff001jy51c/#485dc001cl51c
  controller.id = model.id
})

// Registers RPC
NEWCALL("connections_query", "-Connections --> query")
NEWCALL("svg_query", "-Svg --> query")
