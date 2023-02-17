# allow importing og service local packages
import os
import sys
from config import CONFIG

where_am_i = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, where_am_i+"/__packages__")
# end of local package imports

from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse
from loguru import logger
from logger import init_logging
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

print ("loading")

init_logging()

logger.info("loguru info log")

CONFIG.MESSAGESERVICE_HOST = os.getenv("MESSAGESERVICE_HOST", "ws://localhost:8112")
CONFIG.MESSAGESERVICE_ENDPOINT = os.getenv("MESSAGESERVICE_ENDPOINT", "/$tms")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def htmlPage(wshost):

    html = """<!DOCTYPE html>
<html>
    <head>
        <title>TMS Payload Client</title>
        <link rel="stylesheet" href="/static/style.css" />
        <script type="text/javascript" src="/static/jsonschema.js" defer></script>
        <script type="text/javascript" src="/static/client.js" defer></script>
        <script type="text/javascript" src="/static/ui.js" defer></script>
        <meta name="messagehost" content="%s" />
    </head>
    <body>
        <h1>TMS Payload Client</h1>
        <h2>Your ID: <span id="ws-id"></span></h2>
        <div class="form">
          <form action="" onsubmit="sendMessage(event)">
            <div class="grid">
              <div class="field">
                <label for="messageJson">Payload Json</label>
                <textarea type="text" name="messageJson" autocomplete="off"></textarea>
                <button>Send</button>
              </div>
              <div class="field">
                <label for="publishers">Publishers</label>
                <select name="publishers" size="10"></select>
              </div>
              <div class="field">
                <label for="subscribers">Subscribers</label>
                <select name="subscribers" size="10"></select>
              </div>
              <div class="field">
                <label for="calls">Calls</label>
                <select name="calls" size="10"></select>
              </div>
            </div>
          </form>
        </div>
        <ul id='messages'>
        </ul>
    </body>
</html>""" % (wshost)

    return html


@app.get("/")
async def get(request: Request):
    logger.info("get")
    return HTMLResponse( htmlPage(f'{CONFIG.MESSAGESERVICE_HOST}{CONFIG.MESSAGESERVICE_ENDPOINT}') )

# serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")
