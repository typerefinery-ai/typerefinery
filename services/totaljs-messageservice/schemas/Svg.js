let SVG = []

console.log("svg")

NEWSCHEMA("Svg", function (schema) {
  console.log(schema)
  schema.define("name", "String")
  schema.define("description", "String")
  schema.define("host", "String")
  schema.define("icon", "String")
  schema.define("id", "String")
  schema.define("type", "String")
  schema.define("scope", "String")
  schema.define("port", "Number")

  // Define additional fields but ONLY for TMS schema (definitions/tms.js)
  schema.jsonschema_define("id", "String")
  schema.jsonschema_define("dtcreated", "Date")
  schema.jsonschema_define("dtupdated", "Date")

  schema.setQuery(function ($) {
    // Return all connections
    $.callback(SVG)
  })

  schema.setRead(function ($) {
    // Return specific connection (if exists)
    var svg = SVG.find((u) => u.id === $.id)
    console.log("setRead")
    // Response
    if (svg) $.callback(svg)
    else $.invalid(404)
  })

  schema.setInsert(function ($, model) {
    model.id = UID()
    model.dtcreated = NOW
    console.log("setInsert svg")
    console.log($)
    console.log(model)
    // Insert new connection at the beginning	of array
    SVG.unshift(model)

    // TMS
    PUBLISH("svg_insert", model)

    // Return success object with ID of new connection - { success: true, value: ID }
    $.success(model.id)
  })

  schema.setUpdate(function ($, model) {
    model.dtupdated = NOW
    console.log("setUpdate")
    // Find array index of connection
    var index = SVG.findIndex((u) => u.id === $.id)
    if (index !== -1) {
      // TMS
      PUBLISH("svg_update", model)

      // Replace only values based on schema fields => name, description...
      for (var key of schema.fields) SVG[index][key] = model[key]

      $.success()
    } else $.invalid(404)
  })

  schema.setRemove(function ($) {
    // Find if connection exists
    var svg = SVG.find((u) => u.id === $.id)
    console.log("setRemove")
    // Remove user from 'CONNECTIONS'
    if (svg) {
      // TMS
      PUBLISH("svg_remove", svg)

      SVG = SVG.filter((u) => u.id !== svg.id)

      $.success()
    } else $.invalid(404)
  })
})
