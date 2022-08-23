require("total4")

// https://docs.totaljs.com/total4/ba783001gi51c/#ba7b2001sh51c
TMSCLIENT(
  "http://localhost:8112/$tms/",
  "typerefinery",
  function (err, client, meta) {
    console.log("test")
    // @err {Error/String}
    // @client {WebSocketClient} with extended functionality
    // @meta {Object}
    // client.subscribe(name, callback);
    // client.publish(name, data);
    // client.call(name, data, callback, [timeout]);
    client.subscribe("connections_insert", function (response) {
      // @response {Object}
      console.log(response)
    })
  }
)
