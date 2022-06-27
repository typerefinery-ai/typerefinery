
# allow importing og service local packages
import os
import sys
where_am_i = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(where_am_i, "__packages__"))
sys.path.append(where_am_i)
# end of local package imports

from typing import Optional

from fastapi import FastAPI, Response, Request, Body, Form
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

app = FastAPI()

Logger.add(os.path.join(where_am_i, "logs", "__packages__", f"{__name__}.py.log"), rotation="1 day")
PACKAGE_TARGET_PATH=os.path.join(where_am_i, "__packages__")

# read template/header.py into a string
with open(os.path.join(where_am_i, "template", "header.py"), "r") as header_file:
  HEADER_STRING = header_file.read()
# read template/footer.py into a string
with open(os.path.join(where_am_i, "template", "footer.py"), "r") as footer_file:
  FOOTER_STRING = footer_file.read()
# read template/body-header.py into a string
with open(os.path.join(where_am_i, "template", "body-header.py"), "r") as body_header_file:
  BODY_HEADER_STRING = body_header_file.read()
# read template/body-footer.py into a string
with open(os.path.join(where_am_i, "template", "body-footer.py"), "r") as body_footer_file:
  BODY_FOOTER_STRING = body_footer_file.read()


def importOrInstallPackage(package, logger):
    logger.info(f'checking if {package} is installed.')
    try:
      __import__(package)
      logger.info(f'package {package} is installed.')
    except:
      logger.info(f'package {package} is not installed, installing...')
      logging_call([sys.executable, "-m", "pip", "install", f"--target={PACKAGE_TARGET_PATH}", package], logger)


def runScript(script, logger, args):
    logging_call([sys.executable, script] + args, logger)

# call a subprocess with logger and return the output
def logging_call(popenargs, logger, loglevel=INFO, **kwargs):
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

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Optional[str] = None):
    return {"item_id": item_id, "q": q}

@app.post("/query")
async def read_query(dbhost: str = Form(...), dbport: str = Form(...), dbdatabase: str = Form(...), dbquery: str = Form(...)):
    connection = {}
    connection['dbhost'] = dbhost
    connection['dbport'] = dbport
    connection['dbdatabase'] = dbdatabase
    connection['dbquery'] = dbquery
    # query grakn
    colaGraph = GtoWebCola(dbhost, dbport, dbdatabase, dbquery)
    return json.dumps(colaGraph)


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

@Logger.catch
@app.post("/algorithm")
async def execute_algorithm(response: Response, body: AlgoritmRequestModel):
    # generate unique request id
    requestid = f'{datetime.timestamp(datetime.now())}.{str(random.randint(1, 100000))}'
    # get new name for a new script
    new_script = os.path.join(where_am_i, "algorithm", f'req-{requestid}.py')
    new_script_output = f'{new_script}_output.json'
    response.headers["X-Script"] = os.path.basename(new_script)

    logfile = f'{new_script}.log'
    # add request specific log file
    logfile_hander = Logger.add(logfile, level="INFO", filter=lambda record: record["extra"]["requestid"] == requestid)
    # get specific request logger
    request_logger = Logger.bind(requestid=requestid)

    # encode multiline string to json string
    dbquery_json = json.dumps(body.dbquery)
    algorithmrequirements_json = json.dumps(body.algorithmrequirements)
    request_logger.info(f'request - {body.dbhost}, {body.dbport}, {body.dbdatabase}, {dbquery_json}, {algorithmrequirements_json}')

    # try catch finaly
    try:

      # create new file with raandom name in scripts folder with header, algorithm, and footer as contents
      with open(new_script, "w") as new_file:
        new_file.write(HEADER_STRING)
        new_file.write(BODY_HEADER_STRING)
        new_file.write(body.algorithm)
        new_file.write(BODY_FOOTER_STRING)
        new_file.write(FOOTER_STRING)

      request_logger.info(f'created file - {new_script}')

      # for each algorithmrequirements install package
      for package in body.algorithmrequirements.split('\n'):
          request_logger.info(f'installing - {package}')
          importOrInstallPackage(package, request_logger)

      # run new script
      runScript(new_script, request_logger, [body.dbhost, body.dbport, body.dbdatabase, body.dbquery, new_script_output])

    except Exception as error:
          # code that handle exceptions
        request_logger.error(error)
    finally:
        # code that clean up
        request_logger.info(f'done')
        Logger.remove(logfile_hander)

    if os.path.exists(new_script_output):
      with open(new_script_output, "r") as script_output:
        return script_output.read()
    else:
      return '{}'

@Logger.catch
@app.get("/algorithm/{script}/log")
async def read_algorithm_log(script: str):
  returnfile = os.path.join(where_am_i, "algorithm", f'{script}.log')
  # return contents of logfile withoput encoding
  with open(returnfile, "r") as new_file:
    return Response(content=new_file.read(), media_type="text/plain")


@Logger.catch
@app.get("/algorithm/{script}/script")
async def read_algorithm_script(script: str):
  returnfile = os.path.join(where_am_i, "algorithm", f'{script}')
  # return contents of logfile withoput encoding
  with open(returnfile, "r") as new_file:
    return Response(content=new_file.read(), media_type="text/plain")


@Logger.catch
@app.get("/string2json")
async def read_string2json(source: str = Form(...)):
  return Response(content=json.dumps(source), media_type="text/plain")
