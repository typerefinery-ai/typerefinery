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

# Proxy any files
# https://d3js.org/d3.v4.js
# https://cdn.jsdelivr.net/npm/webcola@3.4.0/WebCola/cola.js
@Logger.catch
@router.get("/webproxy/{path:path}")
async def flowproxy_get(path: str, request: Request, response: Response):
    # split path variable into array
    path_array = path.split("/")
    # get first elemtn of array
    schema = path_array[0]
    # get second element of array
    domain = path_array[1]
    # get rest of the elements of array as path
    path = "/".join(path_array[2:])

    proxy_url = f"{schema}://{domain}/{path}"
    Logger.info(f"proxy flow get: {proxy_url}")
    print(f"proxy flow get: {proxy_url}")
    proxy_data = requests.get(proxy_url ,  timeout=1)
    # return proxy_data as response to client with media type and status code from response
    return Response(content=proxy_data.content, media_type=proxy_data.headers["content-type"], status_code=proxy_data.status_code)
