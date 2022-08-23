import { TMSCLIENT } from "total4"

TMSCLIENT(
  "http://localhost:8112/$tms/",
  "typerefinery",
  function (err, client, meta) {
    console.log(client)
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
