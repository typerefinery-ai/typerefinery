const express = require("express")
const app = express()
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
require("total4")

app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`)

  socket.on("disconnect", () => {
    console.log("user disconnected")
  })

  TMSCLIENT("http://localhost:8112/$tms/", "", function (err, client, meta) {
    console.log("test")
    // @err {Error/String}
    // @client {WebSocketClient} with extended functionality
    // @meta {Object}
    // client.subscribe(name, callback);
    // client.publish(name, data);
    // client.call(name, data, callback, [timeout]);
    client.subscribe("connections_insert", function (response) {
      // @response {Object}
      console.log("recived something")
      console.log(response)
      socket.emit("chat_message", response)
      //
    })
  })

  // socket.emit("chat_message", "yo bro")
})

server.listen(4600, () => {
  console.log("SERVER IS RUNNING")
})

// https://docs.totaljs.com/total4/ba783001gi51c/#ba7b2001sh51c
