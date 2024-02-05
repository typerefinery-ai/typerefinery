from fastapi import APIRouter, Response, Request, Body, Form
from loguru import logger as Logger
import json
import os
from typing import Any, Annotated, Optional
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
with open(os.path.join(CONFIG.APP_SERVICE_LOCATION, "template", "algorithm", "header.py"), "r") as header_file:
  ALGORITHM_HEADER_STRING = header_file.read()
# read template/footer.py into a string
with open(os.path.join(CONFIG.APP_SERVICE_LOCATION, "template", "algorithm", "footer.py"), "r") as footer_file:
  ALGORITHM_FOOTER_STRING = footer_file.read()
# read template/body.py into a string
with open(os.path.join(CONFIG.APP_SERVICE_LOCATION, "template", "algorithm", "body.py"), "r") as body_file:
  ALGORITHM_BODY_STRING = body_file.read()
# read template/body-header.py into a string
with open(os.path.join(CONFIG.APP_SERVICE_LOCATION, "template", "algorithm", "body-header.py"), "r") as body_header_file:
  ALGORITHM_BODY_HEADER_STRING = body_header_file.read()
# read template/body-footer.py into a string
with open(os.path.join(CONFIG.APP_SERVICE_LOCATION, "template", "algorithm", "body-footer.py"), "r") as body_footer_file:
  ALGORITHM_BODY_FOOTER_STRING = body_footer_file.read()


class AlgoritmRequestModel(BaseModel):
    dbhost: str | None = Field(
        default="localhost", title="TypeDB host address"
    )
    dbport: str | None = Field(
        default="8729", title="TypeDB host port"
    )
    dbdatabase: str | None = Field(
        default="typerefinery", title="TypeDB database to use"
    )
    dbquery: str | None = Field(
        default="", title="TypeDB database to use"
    )
    algorithm: str | None = Field(
        default="", title="algorithm code"
    )
    algorithmrequirements: str | None = Field(
        default="", title="install dependencies"
    )
    returnoutput: str | None = Field(
        default="output", title="what to return (output, log, status)"
    )

class AlgorithmModel(BaseModel):
    source: str | None = Field(
        default="", title="algorithm code"
    )
    requirements: str | None = Field(
        default="", title="install dependencies"
    )
    output: str | None = Field(
        default="output", title="what to return (output, log, status)"
    )


@Logger.catch
@router.post("/algorithm")
async def execute_algorithm(request: Request, response: Response, algorithm: AlgorithmModel, config: Annotated[Any, Body()]):
    # generate unique request id
    requestid = f'{datetime.timestamp(datetime.now())}.{str(random.randint(1, 100000))}'
    # get new name for a new script
    new_script_name = f'req-{requestid}.py'
    new_script = os.path.join(CONFIG.APP_USER_DATA_LOCATION, "generated", "algorithm", new_script_name)
    new_script_url = f"/algorithm/{new_script_name}/script"
    new_script_path = new_script
    new_script_output = f'{new_script}.output'
    new_script_output_url = f"/algorithm/{new_script_name}/output"
    new_script_output_path = new_script_output
    new_script_log = f'{new_script}.log'
    new_script_log_url = f"/algorithm/{new_script_name}/log"
    new_script_log_path = new_script_log
    new_script_input = f'{new_script}.input'
    new_script_input_url = f"/algorithm/{new_script_name}/input"
    new_script_input_path = new_script_input

    # add request specific log file
    logfile_hander = Logger.add(new_script_log, level="INFO", filter=lambda record: record["extra"]["requestid"] == requestid)
    # get specific request logger
    request_logger = Logger.bind(requestid=requestid)

    with open(new_script_input, "w") as script_inpuit:
        script_inpuit.write(json.dumps(config))

    scripterror = "false"
    # try catch finaly
    try:

      # create new file with raandom name in scripts folder with header, algorithm, and footer as contents
      with open(new_script, "w") as new_file:
        new_file.write(ALGORITHM_HEADER_STRING)
        new_file.write(ALGORITHM_BODY_HEADER_STRING)
        new_file.write(algorithm.source)
        new_file.write(ALGORITHM_BODY_FOOTER_STRING)
        new_file.write(ALGORITHM_FOOTER_STRING)

      request_logger.info(f'created file - {new_script}')

      # for each algorithmrequirements install package
      for package in algorithm.requirements.split('\n'):
          request_logger.info(f'check dependency - {package}')
          UTILS.importOrInstallPackagePython(package, request_logger)

      # run new script
      UTILS.runScriptPython(new_script, request_logger, [new_script_input, new_script_output])

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
    new_script_input_exists = os.path.exists(new_script_input)
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
      "input": new_script_input_path,
      "input.exists": str(new_script_input_exists),
      "input.url": new_script_input_url,
      "log": new_script_log_path,
      "log.exists": str(new_script_log_exists),
      "log.url": new_script_log_url,
      "return.output": algorithm.output,
	    "Access-Control-Expose-Headers": "output.url,output.exists,output",
    }

    if os.path.exists(new_script_output) and algorithm.output == "output":
      with open(new_script_output, "r") as script_output:
        return Response(content=script_output.read(), media_type="text/plain", headers=returncontent)
    elif os.path.exists(new_script_log) and algorithm.output == "log":
      with open(new_script_log, "r") as script_log:
        return Response(content=script_log.read(), media_type="text/plain", headers=returncontent)
    else:
      return Response(content=json.dumps(returncontent), media_type="application/json", headers=returncontent)

@Logger.catch
@router.get("/algorithm/{script}/log")
async def read_algorithm_log(script: str):
  returnfile = os.path.join(CONFIG.APP_USER_DATA_LOCATION, "generated", "algorithm", f'{script}.log')
  # return contents of logfile withoput encoding
  with open(returnfile, "r") as new_file:
    return Response(content=new_file.read(), media_type="text/plain")


@Logger.catch
@router.get("/algorithm/{script}/script")
async def read_algorithm_script(script: str):
  returnfile = os.path.join(CONFIG.APP_USER_DATA_LOCATION, "generated", "algorithm", f'{script}')
  # return contents of logfile withoput encoding
  with open(returnfile, "r") as new_file:
    return Response(content=new_file.read(), media_type="text/plain")

@Logger.catch
@router.get("/algorithm/{script}/output")
async def read_algorithm_output(script: str):
  returnfile = os.path.join(CONFIG.APP_USER_DATA_LOCATION, "generated", "algorithm", f'{script}.output')
  # return contents of logfile withoput encoding
  with open(returnfile, "r") as new_file:
    return Response(content=new_file.read(), media_type="text/plain")

@Logger.catch
@router.get("/algorithm/{script}/input")
async def read_algorithm_output(script: str):
  returnfile = os.path.join(CONFIG.APP_USER_DATA_LOCATION, "generated", "algorithm", f'{script}.input')
  # return contents of logfile withoput encoding
  with open(returnfile, "r") as new_file:
    return Response(content=new_file.read(), media_type="text/plain")
