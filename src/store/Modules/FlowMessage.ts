/* eslint-disable @typescript-eslint/no-explicit-any */
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
  data: any = { list: [] }

  @Mutation
  setData(item) {
    const idx = this.data.list.findIndex((el) => el.stepId === item.stepId)
    if (idx === -1) {
      this.data.list.push(item)
    } else {
      this.data.list[idx] = item
    }
  }

  // @Action
  // initTMS() {
  //   const subscribe_insert = {
  //     type: "subscribers",
  //     subscribers: ["svg_insert"],
  //   }

  //   const W3CWebSocket = websocket.w3cwebsocket
  //   const client = new W3CWebSocket("ws://127.0.0.1:8112/$tms/")
  //   client.onopen = function () {
  //     console.log("WebSocket Client Connected")
  //     console.log(
  //       "readyState: " + (client.readyState === client.OPEN ? "OPEN" : "CLOSED")
  //     )
  //   }
  //   client.onclose = function () {
  //     console.log("WebSocket Client Closed")
  //   }
  //   client.onerror = function (error) {
  //     console.log("WebSocket Client Error: " + error)
  //   }
  //   client.onmessage = (e) => {
  //     console.log(e)
  //     if (typeof e.data === "string") {
  //       // console.log("Received: '" + e.data + "'")
  //       // console.log(JSON.parse(e.data))
  //       const response = JSON.parse(e.data)
  //       // console.log(response)
  //       // const data = this.context.state.data
  //       // if (data.dtcreated && response.type === "publish") {
  //       //   const d1 = new Date(this.context.state.data.dtcreated)
  //       //   const d2 = new Date(response.data.dtcreated)
  //       //   console.log({ d1: d1.getTime(), d2: d2.getTime() })
  //       //   if (d1.getTime() !== d2.getTime()) {
  //       //     console.log("setting state....!!!!!!!!!!!!")
  //       //     this.context.commit("setData", response.data)
  //       //   }
  //       // } else if (response.type === "publish") {
  //       //   console.log("setting state for the first time+++++++")
  //       //   this.context.commit("setData", response.data)
  //       // }

  //       if (response.type === "publish") {
  //         // console.log(response)
  //         this.context.commit("setData", response.data)
  //       }

  //       sendSubscribe()
  //     }
  //   }

  //   function sendSubscribe() {
  //     if (client.readyState === client.OPEN) {
  //       // console.log("sending subscribe")
  //       client.send(JSON.stringify(subscribe_insert))
  //       // console.log("sending subscribe done")
  //     }
  //   }
  // }
}
