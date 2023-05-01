# allow importing of service local packages
import os
from config import CONFIG
CONFIG = CONFIG(os.path.dirname(os.path.abspath(__file__)))
# end of local package imports

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger as Logger

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

app = FastAPI()

CONFIG.APP_SERVICE_LOCATION = CONFIG.APP_SCRIPT_PATH
CONFIG.APP_USER_DATA_LOCATION = os.getenv("SERVICE_DATA_PATH", args.userdir)
if CONFIG.APP_USER_DATA_LOCATION == "":
  CONFIG.APP_USER_DATA_LOCATION = CONFIG.APP_SCRIPT_PATH

CONFIG.APP_LOG_LOCATION = os.getenv("SERVICE_LOG_PATH", args.logdir)
if CONFIG.APP_LOG_LOCATION == "":
  CONFIG.APP_LOG_LOCATION = CONFIG.APP_SCRIPT_PATH

# load environment variables from .env file
from dotenv import load_dotenv

load_dotenv()

CONFIG.APP_SERVICE_TYPEDB_HOST = os.getenv("TYPEDB_HOST", "localhost")
CONFIG.APP_SERVICE_TYPEDB_PORT = os.getenv("TYPEDB_PORT", "8729")
CONFIG.APP_SERVICE_TYPEDB_DB = os.getenv("TYPEDB_DB", "typerefinery")
CONFIG.APP_SERVICE_FLOW_PORT = os.getenv("FLOW_PORT", "8111")
CONFIG.APP_SERVICE_MESSAGESERVICE_PORT = os.getenv("MESSAGESERVICE_PORT", "8112")
CONFIG.APP_SERVICE_CMS_PORT = os.getenv("CMS_PORT", "8113")
CONFIG.APP_SERVICE_MONGO_PORT = os.getenv("MONGO_PORT", "8180")
CONFIG.APP_SERVICE_NGINX_PORT = os.getenv("NGINX_PORT", "8114")

# setup origins middleware to ensure CORS works
app.add_middleware(
    CORSMiddleware,
    allow_origins=CONFIG.get_origins(),
    allow_credentials=CONFIG.get_raw_bool("allow_credentials"),
    allow_methods=CONFIG.get_raw("allow_methods"),
    allow_headers=CONFIG.get_raw("allow_headers"),
)


Logger.add(os.path.join(CONFIG.APP_LOG_LOCATION, f"{__name__}.py.log"), rotation="1 day")
NODE_HOME_FOLDER_NAME = "node-v18.6.0-win-x64"
# set NODE_HOME_FOLDER_NAME based on OS for windows, linux and darwin
if os.name == "nt":
  NODE_HOME_FOLDER_NAME = "node-v18.6.0-win-x64"
elif os.name == "posix":
  NODE_HOME_FOLDER_NAME = "node-v18.6.0-linux-x64"
elif os.name == "darwin":
  NODE_HOME_FOLDER_NAME = "node-v18.6.0-darwin-x64"

CONFIG.APP_SERVICE_NODE_LOCATION = os.getenv("NODE_HOME", os.path.abspath(os.path.join(CONFIG.APP_SCRIPT_PATH, "..", "_node", NODE_HOME_FOLDER_NAME)))
NODE_EXECUTABLE_FILENAME = "node.exe"
# set NODE_EXECUTABLE_FILENAME file name based on OS for windows, linux and darwin
if os.name == "nt":
  NODE_EXECUTABLE_FILENAME = "node.exe"
else:
  NODE_EXECUTABLE_FILENAME = "node"



CONFIG.APP_SERVICE_NODE_EXECUTABLE = os.getenv("NODE", os.path.join(CONFIG.APP_SERVICE_NODE_LOCATION, NODE_EXECUTABLE_FILENAME))
CONFIG.APP_SERVICE_NPM_EXECUTABLE = os.getenv("NPM", os.path.join(CONFIG.APP_SERVICE_NODE_LOCATION, "node_modules", "npm", "bin", "npm-cli.js") )

Logger.info(CONFIG.toString())

# import modules
from internal import admin
from routers import utils
from routers import createsvg
from routers import algorithm
from routers import transformer
from routers import datastore
from routers import flow
from routers import messageservice

# include routes
app.include_router(admin.router)
app.include_router(utils.router)
app.include_router(createsvg.router)
app.include_router(algorithm.router)
app.include_router(transformer.router)
app.include_router(datastore.router)
app.include_router(flow.router)
app.include_router(messageservice.router)
