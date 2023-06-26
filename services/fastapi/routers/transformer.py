
from fastapi import APIRouter, Response, Request, Body, Form
from loguru import logger as Logger
import json
import os
from pydantic import BaseModel, Field
from datetime import datetime
import random


router = APIRouter()

from config import CONFIG
CONFIG = CONFIG(path=None)

# import Utils from parent module
import sys
sys.path.append("..")
from utils import UTILS
UTILS = UTILS()

# read template/header.py into a string
with open(os.path.join(CONFIG.APP_SERVICE_LOCATION, "template", "transformer", "header.js"), "r") as header_file:
  TRANSFORMER_HEADER_STRING = header_file.read()
# read template/footer.py into a string
with open(os.path.join(CONFIG.APP_SERVICE_LOCATION, "template", "transformer", "footer.js"), "r") as footer_file:
  TRANSFORMER_FOOTER_STRING = footer_file.read()
# read template/body-header.py into a string
with open(os.path.join(CONFIG.APP_SERVICE_LOCATION, "template", "transformer", "body-header.js"), "r") as body_header_file:
  TRANSFORMER_BODY_HEADER_STRING = body_header_file.read()
# read template/body-footer.py into a string
with open(os.path.join(CONFIG.APP_SERVICE_LOCATION, "template", "transformer", "body-footer.js"), "r") as body_footer_file:
  TRANSFORMER_BODY_FOOTER_STRING = body_footer_file.read()


class TransformerRequestModel(BaseModel):
    code: str | None = Field(
        default="", title="transformer code"
    )
    dependencies: list | None = Field(
        default=[], title="install dependencies"
    )
    returnoutput: str | None = Field(
        default="output", title="what to return (output, log, status)"
    )

@Logger.catch
@router.post("/transformer")
async def execute_transformer(request: Request, response: Response, body: TransformerRequestModel):
    # generate unique request id
    requestid = f'{datetime.timestamp(datetime.now())}.{str(random.randint(1, 100000))}'
    # get new name for a new script
    new_script_name = f'req-{requestid}.js'
    new_script = os.path.join(CONFIG.APP_USER_DATA_LOCATION, "generated", "transformer", new_script_name)
    new_script_url = f"/transformer/{new_script_name}/script"
    new_script_path = new_script
    new_script_output = f'{new_script}.output'
    new_script_output_url = f"/transformer/{new_script_name}/output"
    new_script_output_path = new_script_output
    new_script_log = f'{new_script}.log'
    new_script_log_url = f"/transformer/{new_script_name}/log"
    new_script_log_path = new_script_log

    # add request specific log file
    logfile_hander = Logger.add(new_script_log, level="INFO", filter=lambda record: record["extra"]["requestid"] == requestid)
    # get specific request logger
    request_logger = Logger.bind(requestid=requestid)

    # encode multiline string to json string
    requirements_json = json.dumps(body.dependencies)
    request_logger.info(f'request - {requirements_json}')

    scripterror = "false"
    # try catch finaly
    try:

      # create new file with raandom name in scripts folder with header, transformer, and footer as contents
      with open(new_script, "w") as new_file:
        new_file.write(TRANSFORMER_HEADER_STRING)
        new_file.write(TRANSFORMER_BODY_HEADER_STRING)
        new_file.write(body.code)
        new_file.write(TRANSFORMER_BODY_FOOTER_STRING)
        new_file.write(TRANSFORMER_FOOTER_STRING)

      request_logger.info(f'created file - {new_script}')

      # for each transformerrequirements install package
      for package in body.dependencies:
          request_logger.info(f'check dependency - {package}')
          UTILS.importOrInstallPackageNode(package, os.path.join(CONFIG.APP_USER_DATA_LOCATION, "generated", "transformer"), request_logger)

      # run new script
      UTILS.runScriptNode(new_script, os.path.join(CONFIG.APP_USER_DATA_LOCATION, "generated", "transformer"), request_logger, [new_script_output])

    except Exception as error:
          # code that handle exceptions
        request_logger.error(error)
        scripterror = "true"
    finally:
        # code that clean up
        request_logger.info(f'done')
        Logger.remove(logfile_hander)

    new_script_name_exists = os.path.exists(new_script)
    new_script_output_exists = os.path.exists(new_script_output)
    new_script_log_exists = os.path.exists(new_script_log)

    # set response headers and body
    returncontent = {
      "error": scripterror,
      "script.name": new_script_name,
      "script": new_script_path,
      "script.exists": str(new_script_name_exists),
      "script.url": new_script_url,
      "output": new_script_output_path,
      "output.exists": str(new_script_output_exists),
      "output.url": new_script_output_url,
      "log": new_script_log_path,
      "log.exists": str(new_script_log_exists),
      "log.url": new_script_log_url,
      "return.output": body.returnoutput,
	    "Access-Control-Expose-Headers": "output.url,output.exists,output",
    }

    if os.path.exists(new_script_output) and body.returnoutput == "output":
      with open(new_script_output, "r") as script_output:
        return Response(content=script_output.read(), media_type="text/plain", headers=returncontent)
    elif os.path.exists(new_script_log) and body.returnoutput == "log":
      with open(new_script_log, "r") as script_log:
        return Response(content=script_log.read(), media_type="text/plain", headers=returncontent)
    else:
      return Response(content=json.dumps(returncontent), media_type="application/json", headers=returncontent)

@Logger.catch
@router.get("/transformer/{script}/log")
async def read_transformer_log(script: str):
  returnfile = os.path.join(CONFIG.APP_USER_DATA_LOCATION, "generated", "transformer", f'{script}.log')
  # return contents of logfile withoput encoding
  with open(returnfile, "r") as new_file:
    return Response(content=new_file.read(), media_type="text/plain")


@Logger.catch
@router.get("/transformer/{script}/script")
async def read_transformer_script(script: str):
  returnfile = os.path.join(CONFIG.APP_USER_DATA_LOCATION, "generated", "transformer", f'{script}')
  # return contents of logfile withoput encoding
  with open(returnfile, "r") as new_file:
    return Response(content=new_file.read(), media_type="text/plain")

@Logger.catch
@router.get("/transformer/{script}/output")
async def read_transformer_output(script: str):
  returnfile = os.path.join(CONFIG.APP_USER_DATA_LOCATION, "generated", "transformer", f'{script}.output')
  # return contents of logfile withoput encoding
  with open(returnfile, "r") as new_file:
    return Response(content=new_file.read(), media_type="text/plain")
