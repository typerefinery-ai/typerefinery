// import websocket = require('websocket');
import * as websocket from "websocket"
import * as http from "http"
import { json } from "stream/consumers"

const subscribe_insert = {
  type: "subscribers",
  subscribers: ["connections_insert"],
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
