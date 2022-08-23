from fastapi import APIRouter, Response, Form
from fastapi.responses import RedirectResponse
from loguru import logger as Logger
import json

router = APIRouter()

# redirect to docs
@router.get("/", response_class=RedirectResponse, status_code=302)
def read_docs():
    return "/docs"

# print simple text
@router.get("/healthcheck")
def read_docs():
    return "ok"
