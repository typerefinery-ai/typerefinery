import re
from fastapi import APIRouter, Response, Request, Body, Form
from loguru import logger as Logger
import json
import os
from pydantic import BaseModel, Field
from datetime import datetime
import random
import requests
from config import CONFIG

# import websocket
from contextlib import closing
from websocket import create_connection

router = APIRouter()

from config import CONFIG
CONFIG = CONFIG(path=None)

# import Utils from parent module
import sys
sys.path.append("..")
from utils import UTILS
UTILS = UTILS()

#http://localhost:8111/fapi
CONFIG.FLOW_HOST = os.getenv("FLOW_HOST", "http://localhost:8111")
CONFIG.FLOW_API = os.getenv("FLOW_API", "/fapi")

## save design into flow over websocket
@Logger.catch
@router.get("/flow/{flowid}/design")
async def flow_design(flowid: str, request: Request, response: Response):
    service_url_flow = f"ws://localhost:8111/flows/{flowid}"
    dataPayloadWelcome = {"TYPE":"flow"}
    returnData = { "wserror": None }
    Logger.info(f"proxy flow: {service_url_flow}")
    Logger.info(f"payload welcome: {dataPayloadWelcome}")

    try:
      with closing(create_connection(service_url_flow)) as conn:

        # loop while waiting for welcome message
        while True:
          recivedData = conn.recv()
          recivedJson = json.loads(recivedData)
          print("recived message:")
          print(json.dumps(recivedData))
          if recivedJson['TYPE'] == "flow/design":
            break

        returnData = recivedJson['data']

        print("recived data:")
        print(json.dumps(recivedData))


    except Exception as e:
      returnData['wserror'] = str(e)
      print(str(e))

    return Response(content=json.dumps(returnData), media_type="application/json", status_code=200)

## save design into flow over websocket
@Logger.catch
@router.post("/flow/{flowid}/design/save")
async def flow_save(flowid: str, request: Request, response: Response, body: dict = Body(...)):
    service_url_flow = f"ws://localhost:8111/flows/{flowid}"
    dataPayloadWelcome = {"TYPE":"flow"}
    dataPayloadRefresh = {"TYPE":"refresh"}
    dataPayloadSave = { "TYPE": "save", "data": body }
    returnData = { "wserror": None }
    Logger.info(f"proxy flow: {service_url_flow}")
    Logger.info(f"payload welcome: {dataPayloadWelcome}")
    Logger.info(f"payload update: {dataPayloadSave}")

    try:
      with closing(create_connection(service_url_flow)) as conn:

        # loop while waiting for welcome message
        while True:
          recivedData = conn.recv()
          recivedJson = json.loads(recivedData)
          print("recived message:")
          print(json.dumps(recivedData))
          if recivedJson['TYPE'] == "flow/errors":
            break


        print("sending save:")
        print(json.dumps(dataPayloadSave))
        conn.send(json.dumps(dataPayloadSave))

    except Exception as e:
      returnData['wserror'] = str(e)


    return Response(content=json.dumps(returnData), media_type="application/json", status_code=200)



## import flow content into flowstream
@Logger.catch
@router.post("/flow/import")
async def flow_import(request: Request, response: Response, body: dict = Body(...)):
    service_url_proxy = f"{CONFIG.FLOW_HOST}{CONFIG.FLOW_API}/streams_import/"
    Logger.info(f"proxy flow: {service_url_proxy}")
    dataPayload = { "data": json.dumps(body) }
    Logger.info(f"inserting flow: {dataPayload}")
    service_reponse = requests.post(service_url_proxy , data=dataPayload, timeout=1)
    return Response(content=json.dumps(service_reponse.json()), media_type="application/json", status_code=service_reponse.status_code)

## export flow content for a given flowid from flowstream
@Logger.catch
@router.get("/flow/export/{flowid}")
async def flow_export(flowid: str, request: Request, response: Response):
    service_url_proxy = f"{CONFIG.FLOW_HOST}{CONFIG.FLOW_API}/streams_export/{flowid}"
    Logger.info(f"proxy flow: {service_url_proxy}")
    service_reponse = requests.get(service_url_proxy, timeout=1)
    return Response(content=json.dumps(service_reponse.json()), media_type="application/json", status_code=service_reponse.status_code)

## export flow content for a given flowid from flowstream
@Logger.catch
@router.get("/flow/read/{flowid}")
async def flow_export(flowid: str, request: Request, response: Response):
    service_url_proxy = f"{CONFIG.FLOW_HOST}{CONFIG.FLOW_API}/streams_read/{flowid}"
    Logger.info(f"proxy flow: {service_url_proxy}")
    failed = False
    service_reponse_json = {}
    service_reponse_code = 0
    try:
      service_reponse = requests.get(service_url_proxy, timeout=0.01)
      service_reponse_json = service_reponse.json()
      service_reponse_code = service_reponse.status_code
    except requests.exceptions.RequestException:
      failed = True
      Logger.info(f"proxy flow could not read flow: {service_url_proxy}")
      service_reponse_code = 404
      service_reponse_json = { "error": "flow not found" }

    return Response(content=json.dumps(service_reponse_json), media_type="application/json", status_code=service_reponse_code)

## update flow meta into flowstream
@Logger.catch
@router.post("/flow/update")
async def flow_update(request: Request, response: Response, body: dict = Body(...)):
    service_url_proxy = f"{CONFIG.FLOW_HOST}{CONFIG.FLOW_API}/stream_save/"
    Logger.info(f"proxy flow: {service_url_proxy}")
    service_reponse = requests.post(service_url_proxy , data=body, timeout=1)
    return Response(content=json.dumps(service_reponse.json()), media_type="application/json", status_code=service_reponse.status_code)

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
    service_url_create = f"{CONFIG.FLOW_HOST}{CONFIG.FLOW_API}/stream_save/"
    Logger.info(f"proxy flow: {service_url_create}")
    service_reponse = requests.post(service_url_create , data=body.dict())
    if service_reponse.status_code == 200:
        print(service_reponse.json())
        service_url_get = f"{CONFIG.FLOW_HOST}{CONFIG.FLOW_API}/streams/"
        service_reponse = requests.get(service_url_get, timeout=1)
        # for each object in response json find last object that has same reference as body.reference and return it
        return_object = None
        for project in service_reponse.json():
            if project["reference"] == body.reference:
                return_object = project
        return return_object

    return Response(content=json.dumps(service_reponse.json()), media_type="application/json", status_code=service_reponse.status_code)

class CreateSample(BaseModel):
  projectid: str | None = Field(
      default="", title="projectid",
  )
  flowid: str | None = Field(
      default="", title="flowid"
  )
  date: str | None = Field(
      default="", title="Date"
  )

# TODO: update to load samles from files and use the import api call
@Logger.catch
@router.post("/flow/createsample")
async def flow_createsample(request: Request, response: Response, body: CreateSample):
  message = {
    "status": "success"
  }

  # load sample flows to add
  with open(os.path.join(CONFIG.APP_SERVICE_LOCATION, "template", "sampleflow", "database.json"), "r") as sampleflows_file:
    SAMPLEFLOWS = sampleflows_file.read()

  # open flows database
  flowid = body.flowid
  projectid = body.projectid
  flowdate = body.date
  if not flowid or not projectid:
    message["status"] = "Either flowid or projectid is missing"
    return Response(content=json.dumps(message), media_type="application/json", status_code=422)

  isExist= os.path.exists(os.path.join(CONFIG.APP_USER_DATA_LOCATION, "../", "totaljs-flow", "database", "database.json"))

  if isExist:
    with open(os.path.join(CONFIG.APP_USER_DATA_LOCATION, "../", "totaljs-flow", "database", "database.json"), "r") as flowdatabase_file:
        FLOW_DATABASE = flowdatabase_file.read()

        FLOW_DATABASE_JSON = json.loads(FLOW_DATABASE)
        SAMPLEFLOWS_JSON = json.loads(SAMPLEFLOWS)

        # if FLOW_DATABASE_JSON contains flow_name node add it to FLOW_DATABASE_JSON
        if flowid in FLOW_DATABASE_JSON:
            message["status"] = f"flow with id {flowid} already exist in database."
        else:
            # Adding default flow data
            FLOW_DATABASE_JSON[flowid] = SAMPLEFLOWS_JSON

            # Replace dummy ids with Actual Ids
            FLOW_DATABASE_JSON[flowid]["id"] = flowid
            FLOW_DATABASE_JSON[flowid]["name"] = flowid
            FLOW_DATABASE_JSON[flowid]["dtcreated"] = flowdate
            flowData = json.dumps(FLOW_DATABASE_JSON, indent=4)
            flowData = flowData.replace('PROJECT_ID', body.projectid)

            # save flow to database
            with open(os.path.join(CONFIG.APP_USER_DATA_LOCATION, "../", "totaljs-flow", "database", "database.json"), "w") as flowdatabase_file:
                flowdatabase_file.write(flowData)
                message["status"] = f"flow with id {flowid} added to database."

  else:
    f = open(os.path.join(CONFIG.APP_USER_DATA_LOCATION, "../", "totaljs-flow", "database", "database.json"), "x")

    FLOW_DATABASE_JSON = {"variables": {}}
    SAMPLEFLOWS_JSON = json.loads(SAMPLEFLOWS)

    FLOW_DATABASE_JSON[flowid] = SAMPLEFLOWS_JSON
    FLOW_DATABASE_JSON[flowid]["id"] = flowid
    FLOW_DATABASE_JSON[flowid]["name"] = flowid
    FLOW_DATABASE_JSON[flowid]["dtcreated"] = flowdate
    flowData = json.dumps(FLOW_DATABASE_JSON, indent=4)
    flowData = flowData.replace('PROJECT_ID', body.projectid)
    # save flow to database
    with open(os.path.join(CONFIG.APP_USER_DATA_LOCATION, "../", "totaljs-flow", "database", "database.json"), "w") as flowdatabase_file:
        flowdatabase_file.write(flowData)
        message["status"] = f"flow with id {flowid} added to database."

  return Response(content=json.dumps(message), media_type="application/json", status_code=200)



# Proxy fastapi flow
@Logger.catch
@router.post("/flowproxy/{path:path}")
async def flowproxy_post(path: str, request: Request, response: Response, body: dict = Body(...)):
    service_url_proxy = f"{CONFIG.FLOW_HOST}/{path}"
    Logger.info(f"proxy flow post: {service_url_proxy}")
    print(f"proxy flow post: {service_url_proxy}")
    service_reponse = requests.post(service_url_proxy , data=body, timeout=1)
    return Response(content=json.dumps(service_reponse.json()), media_type="application/json", status_code=service_reponse.status_code)

@Logger.catch
@router.get("/flowproxy/{path:path}")
async def flowproxy_get(path: str, request: Request, response: Response):
    service_url_proxy = f"{CONFIG.FLOW_HOST}/{path}"
    Logger.info(f"proxy flow get: {service_url_proxy}")
    print(f"proxy flow get: {service_url_proxy}")
    service_reponse = requests.get(service_url_proxy ,  timeout=1)
    return Response(content=json.dumps(service_reponse.json()), media_type="application/json", status_code=service_reponse.status_code)

@Logger.catch
@router.delete("/flowproxy/{path:path}")
async def flowproxy_get(path: str, request: Request, response: Response):
    service_url_proxy = f"{CONFIG.FLOW_HOST}/{path}"
    Logger.info(f"proxy flow get: {service_url_proxy}")
    print(f"proxy flow get: {service_url_proxy}")
    service_reponse = requests.delete(service_url_proxy ,  timeout=1)
    return Response(content=json.dumps(service_reponse.json()), media_type="application/json", status_code=service_reponse.status_code)

@Logger.catch
@router.put("/flowproxy/{path:path}")
async def flowproxy_put(path: str, request: Request, response: Response, body: dict = Body(...)):
    service_url_proxy = f"{CONFIG.FLOW_HOST}/{path}"
    Logger.info(f"proxy flow put: {service_url_proxy}")
    print(f"proxy flow put: {service_url_proxy}")
    service_reponse = requests.put(service_url_proxy , data=body, timeout=1)
    return Response(content=json.dumps(service_reponse.json()), media_type="application/json", status_code=service_reponse.status_code)
