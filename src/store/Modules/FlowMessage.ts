import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators"
import store from "../index"
import * as websocket from "websocket"

@Module({
  name: "FlowMessage",
  store: store,
  dynamic: true,
  preserveState: localStorage.getItem("flowMessage") !== null,
})
export default class FlowMessage extends VuexModule {
  data = {}

  @Mutation
  setData(data) {
    this.data = data
  }

  @Action
  initTMS() {
    const subscribe_insert = {
      type: "subscribers",
      subscribers: ["svg_insert"],
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
    client.onmessage = (e) => {
      if (typeof e.data === "string") {
        console.log("Received: '" + e.data + "'")
        console.log(JSON.parse(e.data))
        const response = JSON.parse(e.data)
        if (response.type === "publish") {
          this.context.commit("setData", response.data)
        }
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
  }
}
