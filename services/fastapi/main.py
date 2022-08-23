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


# setup origins middleware to ensure CORS works
app.add_middleware(
    CORSMiddleware,
    allow_origins=CONFIG.get_origins(),
    allow_credentials=CONFIG.get_raw_bool("allow_credentials"),
    allow_methods=CONFIG.get_raw("allow_methods"),
    allow_headers=CONFIG.get_raw("allow_headers"),
)


Logger.add(os.path.join(CONFIG.APP_LOG_LOCATION, f"{__name__}.py.log"), rotation="1 day")

# PACKAGE_TARGET_PATH is CONFIG.APP_SERVICE_PACKAGES_PATH


CONFIG.APP_SERVICE_NODE_LOCATION = os.path.abspath(os.path.join(CONFIG.APP_SCRIPT_PATH, "..", "_node", "node-v18.6.0-win-x64"))
CONFIG.APP_SERVICE_NODE_EXECUTABLE = os.path.join(CONFIG.APP_SERVICE_NODE_LOCATION, "node.exe")
CONFIG.APP_SERVICE_NPM_EXECUTABLE = os.path.join(CONFIG.APP_SERVICE_NODE_LOCATION, "node_modules", "npm", "bin", "npm-cli.js")

Logger.info(CONFIG.toString())



# import modules
from internal import admin
from routers import utils
from routers import createsvg
from routers import algorithm
from routers import transformer

# include routes
app.include_router(admin.router)
app.include_router(utils.router)
app.include_router(createsvg.router)
app.include_router(algorithm.router)
app.include_router(transformer.router)
