// import websocket = require('websocket');
import * as websocket from "websocket"
import * as http from "http"
import { json } from "stream/consumers"

const subscribe_insert = {
  type: "subscribe",
  id: "connections_insert",
  data: {
    $id: "https://schemas.totaljs.com/Connections.json",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      name: {
        type: "string",
        $$ID: "name",
        $$REQUIRED: false,
      },
      description: {
        type: "string",
        $$ID: "description",
        $$REQUIRED: false,
      },
      host: {
        type: "string",
        $$ID: "host",
        $$REQUIRED: false,
      },
      icon: {
        type: "string",
        $$ID: "icon",
        $$REQUIRED: false,
      },
      id: {
        type: "string",
        $$ID: "id",
        $$REQUIRED: false,
      },
      type: {
        type: "string",
        $$ID: "type",
        $$REQUIRED: false,
      },
      scope: {
        type: "string",
        $$ID: "scope",
        $$REQUIRED: false,
      },
      port: {
        type: "number",
        $$ID: "port",
        $$REQUIRED: false,
      },
      dtcreated: {
        type: "date",
        $$ID: "dtcreated",
        $$REQUIRED: false,
      },
      dtupdated: {
        type: "date",
        $$ID: "dtupdated",
        $$REQUIRED: false,
      },
    },
  },
}

const W3CWebSocket = websocket.w3cwebsocket
const client = new W3CWebSocket("ws://localhost:8112/$tms/")
client.onopen = function () {
  console.log("WebSocket Client Connected")
  console.log(
    "readyState: " + (client.readyState === client.OPEN ? "OPEN" : "CLOSED")
  )
}
client.onclose = function () {
  console.log("WebSocket Client Closed")
}
client.onerror = function (error) {
  console.log("WebSocket Client Error: " + error)
}
client.onmessage = function (e) {
  if (typeof e.data === "string") {
    console.log("Received: '" + e.data + "'")
    sendSubscribe()
  }
}

function sendSubscribe() {
  if (client.readyState === client.OPEN) {
    console.log("sending subscribe")
    client.send(JSON.stringify(subscribe_insert))
    console.log("sending subscribe done")
  }
}
