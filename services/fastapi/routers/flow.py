
import re
from fastapi import APIRouter, Response, Request, Body, Form
from loguru import logger as Logger
import json
import os
from pydantic import BaseModel, Field
from datetime import datetime
import random
import requests


router = APIRouter()

from config import CONFIG
CONFIG = CONFIG(path=None)

# import Utils from parent module
import sys
sys.path.append("..")
from utils import UTILS
UTILS = UTILS()

# {
#     "icon": "fa fa-satellite",
#     "url": "https://localhost",
#     "name": "<FLOW NAME>",
#     "group": "typerefinery",
#     "reference": "<GUID>",
#     "version": "1.0",
#     "author": "typerefinery",
#     "color": "#61C83B",
#     "readme": "Typerefinery flow"
# }

class FlowSchema(BaseModel):
  icon: str | None = Field(
      default="", title="icon"
  )
  url: str | None = Field(
      default="", title="url"
  )
  name: str | None = Field(
      default="", title="name"
  )
  group: str | None = Field(
      default="", title="group"
  )
  reference: str | None = Field(
      default="", title="reference"
  )
  version: str | None = Field(
      default="", title="version"
  )
  author: str | None = Field(
      default="", title="author"
  )
  color: str | None = Field(
      default="", title="color"
  )
  readme: str | None = Field(
      default="", title="readme"
  )


@Logger.catch
@router.post("/flow/create")
async def flow_create(request: Request, response: Response, body: FlowSchema):
    service_url_create = "http://localhost:8111/fapi/stream_save/"
    Logger.info(f"proxy flow: {service_url_create}")
    service_reponse = requests.post(service_url_create , data=body.dict())
    if service_reponse.status_code == 200:
        print(service_reponse.json())
        service_url_get = "http://localhost:8111/fapi/streams/"
        service_reponse = requests.get(service_url_get)
        # for each object in response json find object that has same reference as body.reference
        for stream in service_reponse.json():
            if stream["reference"] == body.reference:
                return stream

        # if service_reponse.status_code == 200:
        #     return service_reponse.json()
        # print(json.loads(service_reponse.content.decode('utf-8')))
    return Response(content=json.dumps(service_reponse.json()), media_type="application/json", status_code=service_reponse.status_code)
