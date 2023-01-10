// listen for error
window.addEventListener(
  window.MessageService.Client.events.ERROR,
  function (message) {
    console.log(
      `ui event: ${window.MessageService.Client.events.ERROR}`,
      message.detail
    )
  }
)

// listen when the client is ready
window.addEventListener(
  window.MessageService.Client.events.READY,
  function (message) {
    console.log(
      `ui event: ${window.MessageService.Client.events.READY}`,
      message.detail
    )
  }
)

// listen for client id update
window.addEventListener(
  window.MessageService.Client.events.CLIENT_ID,
  function (message) {
    console.log(
      `ui event: ${window.MessageService.Client.events.CLIENT_ID}`,
      message.detail
    )
    document.querySelector("#ws-id").textContent = message.detail
  }
)

// listen for messages
window.addEventListener(
  window.MessageService.Client.events.MESSAGE,
  function (message) {
    console.log(
      `ui event: ${window.MessageService.Client.events.MESSAGE}`,
      message.detail
    )
    var messageText = message.detail
    if (typeof message.detail === "object") {
      messageText = JSON.stringify(message.detail)
      var messageType = message.detail.type

      if (messageType === "meta") {
        var subscribers = message.detail.subscribers
        var publishers = message.detail.publish
        var calls = message.detail.call

        // for each object in subscribers add object id to subscribers select element
        for (var subscriber in subscribers) {
          let option = document.createElement("option")
          option.value = subscribers[subscriber]
          option.text = subscribers[subscriber]
          document.getElementsByName("subscribers")[0].add(option)
        }

        // for each object in publishers add object id to publishers select element
        for (var publisher in publishers) {
          let option = document.createElement("option")
          option.value = publishers[publisher].id
          option.text = publishers[publisher].id
          document.getElementsByName("publishers")[0].add(option)
        }

        // for each object in calls add object id to calls select element
        for (var call in calls) {
          let option = document.createElement("option")
          option.value = calls[call].id
          option.text = calls[call].id
          document.getElementsByName("calls")[0].add(option)
        }
      }
    }
    var messageItem = document.createElement("li")
    var content = document.createTextNode(messageText)
    messageItem.appendChild(content)
    document.getElementById("messages").appendChild(messageItem)
  }
)

function payload_insert(data) {
  console.log("payload_insert", data)
}

// connect to websocket
window.MessageService.Client.connect(
  document.querySelector("meta[name=messagehost]").content,
  function () {
    console.log("tms connected.")
    window.MessageService.Client.subscribe("payload_insert", payload_insert)
  }
)
