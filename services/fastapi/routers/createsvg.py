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

# read template/header.py into a string
with open(os.path.join(CONFIG.APP_SERVICE_LOCATION, "template", "createsvg", "header.txt"), "r") as header_file:
  CREATESVG_HEADER_STRING = header_file.read()
# read template/footer.py into a string
with open(os.path.join(CONFIG.APP_SERVICE_LOCATION, "template", "createsvg", "footer.txt"), "r") as footer_file:
  CREATESVG_FOOTER_STRING = footer_file.read()
# read template/body-header.py into a string
with open(os.path.join(CONFIG.APP_SERVICE_LOCATION, "template", "createsvg", "body-header.txt"), "r") as body_header_file:
  CREATESVG_BODY_HEADER_STRING = body_header_file.read()
# read template/body-footer.py into a string
with open(os.path.join(CONFIG.APP_SERVICE_LOCATION, "template", "createsvg", "body-footer.txt"), "r") as body_footer_file:
  CREATESVG_BODY_FOOTER_STRING = body_footer_file.read()
# read template/header-include.py into a string
with open(os.path.join(CONFIG.APP_SERVICE_LOCATION, "template", "createsvg", "header-include.txt"), "r") as header_include_file:
  CREATESVG_HEADER_INCLUDE_STRING = header_include_file.read()


class CodeRequestModel(BaseModel):
    code: str | None = Field(
        default="", title="code"
    )
    dependecies: list | None = Field(
        default=[], title="dependecies"
    )
    returnoutput: str | None = Field(
        default="output", title="what to return (output, log, status)"
    )

CREATESVG_ENDPOINT_NAME = "createSvg"
CREATESVG_DATA_FOLDER = "createsvg"
@Logger.catch
@router.post(f"/{CREATESVG_ENDPOINT_NAME}")
async def execute_createsvg(request: Request, response: Response, body: CodeRequestModel):
    # generate unique request id
    requestid = f'{datetime.timestamp(datetime.now())}.{str(random.randint(1, 100000))}'
    # get new name for a new script
    new_output_name = f'req-{requestid}.svg'
    new_output = os.path.join(CONFIG.APP_USER_DATA_LOCATION, "generated", f"{CREATESVG_DATA_FOLDER}", new_output_name)
    new_output_url = f"/{CREATESVG_ENDPOINT_NAME}/{new_output_name}/output"
    new_output_log = f'{new_output}.log'
    new_output_log_url = f"/{CREATESVG_ENDPOINT_NAME}/{new_output_name}/log"
    new_output_log_path = new_output_log

    # add request specific log file
    logfile_hander = Logger.add(new_output_log, level="INFO", filter=lambda record: record["extra"]["requestid"] == requestid)
    # get specific request logger
    request_logger = Logger.bind(requestid=requestid)

    # encode multiline string to json string
    requirements_json = json.dumps(body.dependecies)
    request_logger.info(f'request - {requirements_json}')

    # for each entry in requirements_array, substitute ${URL} in CREATESVG_HEADER_INCLUDE_STRING and add to new string
    requirements_string = ""
    for entry in body.dependecies:
      requirements_string += CREATESVG_HEADER_INCLUDE_STRING.replace("${URL}", entry)
      request_logger.info(f'request - {requirements_string}')


    scripterror = "false"
    # try catch finaly
    try:
      # create new file with raandom name in scripts folder with header, body, and footer as contents
      with open(new_output, "w") as new_file:
        new_file.write(CREATESVG_HEADER_STRING)
        new_file.write(requirements_string)
        new_file.write(CREATESVG_BODY_HEADER_STRING)
        new_file.write(body.code)
        new_file.write(CREATESVG_BODY_FOOTER_STRING)
        new_file.write(CREATESVG_FOOTER_STRING)

      request_logger.info(f'created file - {new_output}')

    except Exception as error:
          # code that handle exceptions
        request_logger.error(error)
        scripterror = "true"
    finally:
        # code that clean up
        request_logger.info(f'done')
        Logger.remove(logfile_hander)

    new_output_exists = os.path.exists(new_output)
    new_output_log_exists = os.path.exists(new_output_log)

    # set response headers and body
    returncontent = {
      "error": scripterror,
      "output.name": new_output_name,
      "output": new_output,
      "output.exists": str(new_output_exists),
      "output.url": new_output_url,
      "log": new_output_log_path,
      "log.exists": str(new_output_log_exists),
      "log.url": new_output_log_url,
      "return.output": body.returnoutput,
	    "Access-Control-Expose-Headers": "output.url,output.exists,output",
    }

    if os.path.exists(new_output_log) and body.returnoutput == "log":
      with open(new_output_log, "r") as script_log:
        return Response(content=script_log.read(), media_type="text/plain", headers=returncontent)
    else:
      with open(new_output, "r") as script_output:
        return Response(content=script_output.read(), media_type="text/plain", headers=returncontent)

@Logger.catch
@router.get(f"/{CREATESVG_ENDPOINT_NAME}" + "/{script}/log")
async def read_createsvg_log(script: str):
  returnfile = os.path.join(CONFIG.APP_USER_DATA_LOCATION, "generated", f"{CREATESVG_DATA_FOLDER}", f'{script}.log')
  # return contents of logfile withoput encoding
  with open(returnfile, "r") as new_file:
    return Response(content=new_file.read(), media_type="text/plain")


@Logger.catch
@router.get(f"/{CREATESVG_ENDPOINT_NAME}" + "{script}/output")
async def read_createsvg_output(script: str):
  returnfile = os.path.join(CONFIG.APP_USER_DATA_LOCATION, "generated", f"{CREATESVG_DATA_FOLDER}", f'{script}.output')
  # return contents of logfile withoput encoding
  with open(returnfile, "r") as new_file:
    return Response(content=new_file.read(), media_type="text/plain")
