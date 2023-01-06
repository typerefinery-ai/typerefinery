/*
 * SVG
 */

NEWPUBLISH("svg_insert", "Svg")

NEWSUBSCRIBE("svg_insert", "Svg")


SUBSCRIBE("svg_insert", function (model) {
  console.log(model, "inserting")
  EXEC("+Svg --> insert", model, NOOP)
})

// SUBSCRIBE("svg_update", function (model) {
//   var controller = EXEC("+Svg --> update", model, NOOP)

//   // Set $.id param to EXEC call - https://docs.totaljs.com/total4/407ff001jy51c/#485dc001cl51c
//   controller.id = model.id
// })

// SUBSCRIBE("svg_remove", function (model) {
//   var controller = EXEC("+Svg --> remove", null, NOOP)

//   // Set $.id param to EXEC call - https://docs.totaljs.com/total4/407ff001jy51c/#485dc001cl51c
//   controller.id = model.id
// })

// Registers RPC
NEWCALL("svg_query", "-Svg --> query")

/**
 * PAYLOAD
 */

NEWPUBLISH("payload_insert", "Payload")
NEWSUBSCRIBE("payload_insert", "Payload")
NEWSUBSCRIBE("payload_update", "Payload")
NEWSUBSCRIBE("payload_remove", "Payload")

SUBSCRIBE("payload_insert", function (model) {
  console.log(model, "inserting")
  EXEC("+Payload --> insert", model, NOOP)
})

SUBSCRIBE("payload_update", function (model) {
  var controller = EXEC("+Payload --> update", model, NOOP)

  // Set $.id param to EXEC call - https://docs.totaljs.com/total4/407ff001jy51c/#485dc001cl51c
  controller.id = model.id
})

SUBSCRIBE("payload_remove", function (model) {
  var controller = EXEC("+Payload --> remove", null, NOOP)

  // Set $.id param to EXEC call - https://docs.totaljs.com/total4/407ff001jy51c/#485dc001cl51c
  controller.id = model.id
})

// Registers RPC
NEWCALL("payload_query", "-Payload --> query")
