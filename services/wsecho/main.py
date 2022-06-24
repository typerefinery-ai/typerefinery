# allow importing og service local packages
import os
import sys

where_am_i = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, where_am_i+"/__packages__")
# end of local package imports

from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse
from loguru import logger
from logger import init_logging
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

print ("loading")

init_logging()

logger.info("loguru info log")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def htmlPage(host,port):

    html = """<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <h2>Your ID: <span id="ws-id"></span></h2>
        <form action="" onsubmit="sendMessage(event)">
            <input type="text" id="messageText" autocomplete="off"/>
            <button>Send</button>
        </form>
        <ul id='messages'>
        </ul>
        <script>
            var client_id = Date.now()
            document.querySelector("#ws-id").textContent = client_id;
            var messages = document.getElementById('messages')
            var ws = new WebSocket(`ws://%s:%s/ws/${client_id}`);
            ws.onopen = function(e) {
                logMessage("[open] Connection established");
            };
            ws.onerror = function(error) {
                var message = JSON.stringify(error);
                logMessage(`[error] ${message}`);
            };
            ws.onmessage = function(event) {
                logMessage(event.data)
            };
            function logMessage(text) {
                var message = document.createElement('li')
                var content = document.createTextNode(text)
                message.appendChild(content)
                messages.appendChild(message)
            }
            function sendMessage(event) {
                var input = document.getElementById("messageText")
                ws.send(input.value)
                input.value = ''
                event.preventDefault()
            }
        </script>
    </body>
</html>""" % (host,port)

    return html

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


@app.get("/")
async def get(request: Request):
    logger.info("get")
    return HTMLResponse(htmlPage(str(request.url.hostname), str(request.url.port)))

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    logger.info("connect: {client_id}", client_id=client_id)
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"You wrote: {data}", websocket)
            logger.info(f"Client #{client_id} says: {data}")
            await manager.broadcast(f"Client #{client_id} says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{client_id} left the chat")

