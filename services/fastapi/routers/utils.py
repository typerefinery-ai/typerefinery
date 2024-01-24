from fastapi import APIRouter, Response, Form
from loguru import logger as Logger
import json

router = APIRouter()

@Logger.catch
@router.get("/string2json")
async def convert_string2json(source: str = Form(...)):
  return Response(content=json.dumps(source), media_type="text/plain")

@Logger.catch
@router.post("/string2json")
async def convert_string2json_post(source: str = Form(...)):
  return Response(content=json.dumps(source), media_type="text/plain")
