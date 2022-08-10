
# allow importing og service local packages
import os
import sys
SCRIPT_PATH = os.path.dirname(os.path.abspath(__file__))
SERVICE_PACKAGES_PATH = os.path.join(SCRIPT_PATH, "__packages__")
os.environ["SERVICE_PACKAGES_PATH"] = SERVICE_PACKAGES_PATH
sys.path.insert(0, SERVICE_PACKAGES_PATH)
sys.path.append(SCRIPT_PATH)
# end of local package imports

from typing import Optional

from fastapi import FastAPI, Response, Request, Body, Form
from fastapi.responses import RedirectResponse
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
import json
from scripts.G_to_WebCola import get_data as GtoWebCola
from datetime import datetime

import subprocess
from loguru import logger as Logger
from posixpath import basename
import random
from pydantic import BaseModel, Field
import select
from logging import DEBUG, ERROR, INFO
import argparse


def getArgs():

  parser = argparse.ArgumentParser(description="Script params",
                                formatter_class=argparse.ArgumentDefaultsHelpFormatter)
  parser.add_argument("--user-dir", nargs='?', dest="userdir", default="", help="user data (default: %(default)s)")
  parser.add_argument("--log-dir", nargs='?', dest="logdir", default="", help="user data (default: %(default)s)")
  parser.add_argument("host", nargs='?', default="localhost", help="server hots (default: %(default)s)")
  parser.add_argument("port", nargs='?', default="8000", help="server port (default: %(default)s)")
  parser.add_argument("--app-dir", nargs='?', dest="appdir", default="./services", help="service path (default: %(default)s)")
  return parser.parse_known_args()

args, unknown = getArgs()

SERVICE_LOCATION = SCRIPT_PATH

USER_DATA_LOCATION = os.getenv("SERVICE_DATA_PATH", args.userdir)
if USER_DATA_LOCATION == "":
  USER_DATA_LOCATION = SCRIPT_PATH

LOG_LOCATION = os.getenv("SERVICE_LOG_PATH", args.logdir)
if LOG_LOCATION == "":
  LOG_LOCATION = SCRIPT_PATH


app = FastAPI()

# generarte origins
origins_schemas = [ "http", "https" ]
origins_ports = [ "3000", "3001", "8000", "8001" ]
origins_hosts = [ "localhost"]
origins = []
# for each origins_schemas, origins_ports, origins_hosts update the origins list
for origins_schema in origins_schemas:
  for origins_port in origins_ports:
    for origins_host in origins_hosts:
      origins.append(f"{origins_schema}://{origins_host}:{origins_port}")

# setup origins middleware to ensure CORS works
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Logger.add(os.path.join(LOG_LOCATION, f"{__name__}.py.log"), rotation="1 day")
PACKAGE_TARGET_PATH=os.path.join(SERVICE_LOCATION, "__packages__")


NODE_SERVICE_LOCATION = os.path.abspath(os.path.join(SCRIPT_PATH, "..", "_node", "node-v18.6.0-win-x64"))
NODE_SERVICE = os.path.join(NODE_SERVICE_LOCATION, "node.exe")
NPM_SERVICE_LOCATION = os.path.join(NODE_SERVICE_LOCATION, "node_modules", "npm", "bin", "npm-cli.js")

Logger.info(f'NODE_SERVICE_LOCATION: {NODE_SERVICE_LOCATION}')
Logger.info(f'NODE_SERVICE: {NODE_SERVICE}')
Logger.info(f'NPM_SERVICE_LOCATION: {NPM_SERVICE_LOCATION}')


Logger.info(f'SERVICE_LOCATION: {SERVICE_LOCATION}')
Logger.info(f'SERVICE_USER_DATA_LOCATION: {USER_DATA_LOCATION}')
Logger.info(f'SERVICE_USER_DATA_LOCATION env: {os.getenv("SERVICE_DATA_PATH")}')
Logger.info(f'SERVICE_USER_DATA_LOCATION arg: {args.userdir}')
Logger.info(f'ORIGINS: {origins}')

# read template/header.py into a string
with open(os.path.join(SERVICE_LOCATION, "template", "algorithm", "header.py"), "r") as header_file:
  ALGORITHM_HEADER_STRING = header_file.read()
# read template/footer.py into a string
with open(os.path.join(SERVICE_LOCATION, "template", "algorithm", "footer.py"), "r") as footer_file:
  ALGORITHM_FOOTER_STRING = footer_file.read()
# read template/body-header.py into a string
with open(os.path.join(SERVICE_LOCATION, "template", "algorithm", "body-header.py"), "r") as body_header_file:
  ALGORITHM_BODY_HEADER_STRING = body_header_file.read()
# read template/body-footer.py into a string
with open(os.path.join(SERVICE_LOCATION, "template", "algorithm", "body-footer.py"), "r") as body_footer_file:
  ALGORITHM_BODY_FOOTER_STRING = body_footer_file.read()


# read template/header.py into a string
with open(os.path.join(SERVICE_LOCATION, "template", "transformer", "header.js"), "r") as header_file:
  TRANSFORMER_HEADER_STRING = header_file.read()
# read template/footer.py into a string
with open(os.path.join(SERVICE_LOCATION, "template", "transformer", "footer.js"), "r") as footer_file:
  TRANSFORMER_FOOTER_STRING = footer_file.read()
# read template/body-header.py into a string
with open(os.path.join(SERVICE_LOCATION, "template", "transformer", "body-header.js"), "r") as body_header_file:
  TRANSFORMER_BODY_HEADER_STRING = body_header_file.read()
# read template/body-footer.py into a string
with open(os.path.join(SERVICE_LOCATION, "template", "transformer", "body-footer.js"), "r") as body_footer_file:
  TRANSFORMER_BODY_FOOTER_STRING = body_footer_file.read()


def importOrInstallPackagePython(package, logger):
    logger.info(f'checking if {package} is installed.')
    try:
      __import__(package)
      logger.info(f'package {package} is installed.')
    except:
      logger.info(f'package {package} is not installed, installing...')
      logging_call([sys.executable, "-m", "pip", "install", f"--target={PACKAGE_TARGET_PATH}", package], logger)


def importOrInstallPackageNode(package, logger):
    kwargs= { "cwd": os.path.join(USER_DATA_LOCATION, "transformer") }
    logger.info(f'checking if {package} is installed.')

    output = logging_call2([NODE_SERVICE, NPM_SERVICE_LOCATION, "ls", package, "--json"], logger, **kwargs)
    logger.info(f'output {output}')
    # parse output as json and check if it has a keyword "dependencies" and name of package
    json_output = json.loads(output)
    if "dependencies" in json_output and package in json_output["dependencies"]:
      logger.info(f'package {package} is installed.')
    else:
      logger.info(f'package {package} is not installed, installing...')
      logging_call([NODE_SERVICE, NPM_SERVICE_LOCATION, "install", package], logger, **kwargs)

def runScriptPython(script, logger, args):
    logging_call([sys.executable, script] + args, logger)

def runScriptNode(script, logger, args):
    kwargs= { "cwd": os.path.join(USER_DATA_LOCATION, "transformer") }
    logging_call([NODE_SERVICE, script] + args, logger, **kwargs)

# call a subprocess with logger and return the output
def logging_call(popenargs, logger, **kwargs):
    logger.info(popenargs)
    process = subprocess.Popen(popenargs, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, **kwargs)

    def check_io():
      while True:
        # declare stderr as empty
        stderr = b''

        if process.stdout:
          stdout = process.stdout.readline().decode()
        if process.stderr:
          stderr = process.stderr.readline().decode()

        if stdout:
          logger.info(stdout)
        elif stderr:
          logger.info(stderr)
        else:
          break

    # keep checking stdout/stderr until the child exits
    while process.poll() is None:
      check_io()

# run a subprocess with logger and return the output
def logging_call2(popenargs, logger, **kwargs):
    logger.info(popenargs)
    process = subprocess.run(popenargs, capture_output=True, **kwargs)
    return process.stdout.decode()

# redirect to docs
@app.get("/", response_class=RedirectResponse, status_code=302)
def read_docs():
    return "/docs"

# redirect to docs
@app.get("/healthcheck")
def read_docs():
    return "ok"

class AlgoritmRequestModel(BaseModel):
    dbhost: str | None = Field(
        default="localhost", title="TypeDB host address"
    )
    dbport: str | None = Field(
        default="1729", title="TypeDB host port"
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
        default="", title="install dependecies"
    )
    returnoutput: str | None = Field(
        default="output", title="what to return (output, log, status)"
    )

@Logger.catch
@app.post("/algorithm")
async def execute_algorithm(request: Request, response: Response, body: AlgoritmRequestModel):
    # generate unique request id
    requestid = f'{datetime.timestamp(datetime.now())}.{str(random.randint(1, 100000))}'
    # get new name for a new script
    new_script_name = f'req-{requestid}.py'
    new_script = os.path.join(USER_DATA_LOCATION, "algorithm", new_script_name)
    new_script_url = f"/algorithm/{new_script_name}/script"
    new_script_path = new_script
    new_script_output = f'{new_script}.output'
    new_script_output_url = f"/algorithm/{new_script_name}/output"
    new_script_output_path = new_script_output
    new_script_log = f'{new_script}.log'
    new_script_log_url = f"/algorithm/{new_script_name}/log"
    new_script_log_path = new_script_log

    # add request specific log file
    logfile_hander = Logger.add(new_script_log, level="INFO", filter=lambda record: record["extra"]["requestid"] == requestid)
    # get specific request logger
    request_logger = Logger.bind(requestid=requestid)

    # encode multiline string to json string
    dbquery_json = json.dumps(body.dbquery)
    algorithmrequirements_json = json.dumps(body.algorithmrequirements)
    request_logger.info(f'request - {body.dbhost}, {body.dbport}, {body.dbdatabase}, {dbquery_json}, {algorithmrequirements_json}')

    scripterror = "false"
    # try catch finaly
    try:

      # create new file with raandom name in scripts folder with header, algorithm, and footer as contents
      with open(new_script, "w") as new_file:
        new_file.write(ALGORITHM_HEADER_STRING)
        new_file.write(ALGORITHM_BODY_HEADER_STRING)
        new_file.write(body.algorithm)
        new_file.write(ALGORITHM_BODY_FOOTER_STRING)
        new_file.write(ALGORITHM_FOOTER_STRING)

      request_logger.info(f'created file - {new_script}')

      # for each algorithmrequirements install package
      for package in body.algorithmrequirements.split('\n'):
          request_logger.info(f'check dependency - {package}')
          importOrInstallPackagePython(package, request_logger)

      # run new script
      runScriptPython(new_script, request_logger, [body.dbhost, body.dbport, body.dbdatabase, body.dbquery, new_script_output])

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
@app.get("/algorithm/{script}/log")
async def read_algorithm_log(script: str):
  returnfile = os.path.join(USER_DATA_LOCATION, "algorithm", f'{script}.log')
  # return contents of logfile withoput encoding
  with open(returnfile, "r") as new_file:
    return Response(content=new_file.read(), media_type="text/plain")


@Logger.catch
@app.get("/algorithm/{script}/script")
async def read_algorithm_script(script: str):
  returnfile = os.path.join(USER_DATA_LOCATION, "algorithm", f'{script}')
  # return contents of logfile withoput encoding
  with open(returnfile, "r") as new_file:
    return Response(content=new_file.read(), media_type="text/plain")

@Logger.catch
@app.get("/algorithm/{script}/output")
async def read_algorithm_output(script: str):
  returnfile = os.path.join(USER_DATA_LOCATION, "algorithm", f'{script}.output')
  # return contents of logfile withoput encoding
  with open(returnfile, "r") as new_file:
    return Response(content=new_file.read(), media_type="text/plain")

@Logger.catch
@app.get("/string2json")
async def convert_string2json(source: str = Form(...)):
  return Response(content=json.dumps(source), media_type="text/plain")


class TransformerRequestModel(BaseModel):
    transformer: str | None = Field(
        default="", title="transformer code"
    )
    transformerrequirements: str | None = Field(
        default="", title="install dependecies"
    )
    returnoutput: str | None = Field(
        default="output", title="what to return (output, log, status)"
    )

@Logger.catch
@app.post("/transformer")
async def execute_transformer(request: Request, response: Response, body: TransformerRequestModel):
    # generate unique request id
    requestid = f'{datetime.timestamp(datetime.now())}.{str(random.randint(1, 100000))}'
    # get new name for a new script
    new_script_name = f'req-{requestid}.js'
    new_script = os.path.join(USER_DATA_LOCATION, "transformer", new_script_name)
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
    transformerrequirements_json = json.dumps(body.transformerrequirements)
    request_logger.info(f'request - {transformerrequirements_json}')

    scripterror = "false"
    # try catch finaly
    try:

      # create new file with raandom name in scripts folder with header, transformer, and footer as contents
      with open(new_script, "w") as new_file:
        new_file.write(TRANSFORMER_HEADER_STRING)
        new_file.write(TRANSFORMER_BODY_HEADER_STRING)
        new_file.write(body.transformer)
        new_file.write(TRANSFORMER_BODY_FOOTER_STRING)
        new_file.write(TRANSFORMER_FOOTER_STRING)

      request_logger.info(f'created file - {new_script}')

      # for each transformerrequirements install package
      for package in body.transformerrequirements.split('\n'):
          request_logger.info(f'check dependency - {package}')
          importOrInstallPackageNode(package, request_logger)

      # run new script
      runScriptNode(new_script, request_logger, [new_script_output])

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
@app.get("/transformer/{script}/log")
async def read_transformer_log(script: str):
  returnfile = os.path.join(USER_DATA_LOCATION, "transformer", f'{script}.log')
  # return contents of logfile withoput encoding
  with open(returnfile, "r") as new_file:
    return Response(content=new_file.read(), media_type="text/plain")


@Logger.catch
@app.get("/transformer/{script}/script")
async def read_transformer_script(script: str):
  returnfile = os.path.join(USER_DATA_LOCATION, "transformer", f'{script}')
  # return contents of logfile withoput encoding
  with open(returnfile, "r") as new_file:
    return Response(content=new_file.read(), media_type="text/plain")

@Logger.catch
@app.get("/transformer/{script}/output")
async def read_transformer_output(script: str):
  returnfile = os.path.join(USER_DATA_LOCATION, "transformer", f'{script}.output')
  # return contents of logfile withoput encoding
  with open(returnfile, "r") as new_file:
    return Response(content=new_file.read(), media_type="text/plain")
