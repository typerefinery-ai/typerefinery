import { client as WebSocketClient, connection } from "websocket"
let Connection: connection

console.log("create ws client")
const ws = new WebSocketClient()

console.log("set events")
ws.on("connectFailed", function (err) {
  console.log(err)
})

ws.on("connect", function (con) {
  Connection = con
  con.on("error", function (err) {
    console.log("connection error: " + err.stack)
  })

  con.on("close", function (code, reason) {
    // Is this always error or can this be intended...?
    console.log("connection closed: " + reason + " (" + code + ")")
  })

  con.on("message", function (response) {
    if (response.type !== "utf8") return false
    const message = response.utf8Data
    console.log(message)
  })
})
console.log("connect to server")
ws.connect("http://localhost:8112/$tms/")

console.log("done")
