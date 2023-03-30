let PAYLOAD = []
const step_prefix = "payload"

console.log(step_prefix)

NEWSCHEMA("Payload", function (schema) {
  console.log(schema)
  schema.define("payload", "String")
  schema.define("topic", "String")

  // Define additional fields but ONLY for TMS schema (definitions/tms.js)
  schema.jsonschema_define("id", "String")
  schema.jsonschema_define("dtcreated", "Date")
  schema.jsonschema_define("dtupdated", "Date")

  schema.setQuery(function ($) {
    // Return all connections
    $.callback(PAYLOAD)
  })

  schema.setRead(function ($) {
    // Return specific connection (if exists)
    var svg = PAYLOAD.find((u) => u.id === $.id)
    console.log(`${step_prefix}_read`)
    // Response
    if (svg) $.callback(svg)
    else $.invalid(404)
  })

  schema.setInsert(function ($, model) {
    model.id = UID()
    model.dtcreated = NOW
    console.log(`${step_prefix}_insert`)
    console.log($)
    console.log(model)
    // Insert new connection at the beginning	of array
    PAYLOAD.unshift(model)

    // TMS
    PUBLISH(`${step_prefix}_insert`, model)

    // Return success object with ID of new connection - { success: true, value: ID }
    $.success(model.id)
  })

  schema.setUpdate(function ($, model) {
    model.dtupdated = NOW
    console.log(`${step_prefix}_update`)
    // Find array index of connection
    var index = PAYLOAD.findIndex((u) => u.id === $.id)
    if (index !== -1) {
      // TMS
      PUBLISH(`${step_prefix}_update`, model)

      // Replace only values based on schema fields => name, description...
      for (var key of schema.fields) PAYLOAD[index][key] = model[key]

      $.success()
    } else $.invalid(404)
  })

  schema.setRemove(function ($) {
    // Find if connection exists
    var apayload = PAYLOAD.find((u) => u.id === $.id)
    console.log(`${step_prefix}_remove`)
    // Remove user from 'CONNECTIONS'
    if (apayload) {
      // TMS
      PUBLISH(`${step_prefix}_remove`, apayload)

      PAYLOAD = PAYLOAD.filter((u) => u.id !== apayload.id)

      $.success()
    } else $.invalid(404)
  })
})
