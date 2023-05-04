import base64
import io
import re
from typing import Annotated
from click import File
from fastapi import APIRouter, Response, Request, Body, Form
from fastapi.datastructures import UploadFile
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

CONFIG.FILE_HOST = os.getenv("FILE_HOST", "http://localhost:8199") 
CONFIG.FILE_API = os.getenv("FILE_API", "/api") 

FILE_ENCODING = 'utf-8'

## upload the file and return its path
@Logger.catch
@router.post("/fileproxy/{path:path}") 
async def fileproxy_post(file: Annotated[UploadFile, File()]): 

  file_url_proxy = f"{CONFIG.FILE_HOST}{CONFIG.FILE_API}/{file.filename}?type=UPLOAD_FILE&overwrite=true" 
  Logger.info(f"proxy flow get: {file_url_proxy}") 
  print(f"proxy flow get: {file_url_proxy}") 

  # convert the binary data into rawdata for api 
  rawData = io.BytesIO(file.file.read()) 

  # construct the request header 
  Logger.info(f"File file: {file.content_type}") 

  headers = { 
     'Content-Type': f"{file.content_type}" 
     } 
  
  file_reponse = requests.post(file_url_proxy , data=rawData, headers=headers) 
  Logger.info(f"proxy respone: {file_reponse.content}") 
  return Response(content=json.dumps([{"filePath":file_reponse.content}]), media_type="application/json", status_code=file_reponse.status_code) 


## fetch the file based on the fileName
@Logger.catch
@router.get("/fileproxy/{fileName:path}") 
async def fileproxy_get(fileName: str, request: Request, response: Response): 
  file_url_proxy = f"{CONFIG.FILE_HOST}{CONFIG.FILE_API}/{fileName}" 
  Logger.info(f"proxy flow get: {file_url_proxy}") 
  print(f"proxy flow get: {file_url_proxy}") 
  file_reponse = requests.get(file_url_proxy , timeout=1) 
  Logger.info(f"proxy respone: {file_reponse.content}") 
  # convert file binary response to the base64 
  base64_bytes = base64.b64encode(file_reponse.content) 
  # convert the base64 to string 
  base64_string = base64_bytes.decode(FILE_ENCODING) 

  return Response(content=json.dumps([{"data":base64_string}]), media_type="application/json", status_code=file_reponse.status_code)
