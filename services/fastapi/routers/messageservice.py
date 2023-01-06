import re
from fastapi import APIRouter, Response, Request, Body, Form
from loguru import logger as Logger
import json
import os
from pydantic import BaseModel, Field
from datetime import datetime
import random
import requests
# import websockets
from websocket import create_connection


router = APIRouter()

from config import CONFIG
CONFIG = CONFIG(path=None)

# import Utils from parent module
import sys
sys.path.append("..")
from utils import UTILS
UTILS = UTILS()

# {
#     "payload": "fastapi"
# }

class PayloadSchema(BaseModel):
  payload: str | None = Field(
      default="", title="payload"
  )

@Logger.catch
@router.post("/payload/create")
async def flow_create(request: Request, response: Response, body: dict = Body(...)):
    service_url_create = "ws://localhost:8112/$tms"
    print(json.dumps(body))
    data = { "type": 'subscribe', "id": 'payload_insert', "data": { "payload":  json.dumps(body) } }

    try:
      ws = create_connection(service_url_create)
      ws.send(json.dumps(data))
      ws.close()
    except Exception as e:
      data['error'] = str(e)


    return Response(content=json.dumps(data), media_type="application/json", status_code=200)


