# allow importing of service local packages
import os
from config import CONFIG
CONFIG = CONFIG(os.path.dirname(os.path.abspath(__file__)))
# end of local package imports

import builtins
builtins.SERVER_MODE = True

from pgadmin4 import app

from loguru import logger as Logger

import argparse


def getArgs():

  parser = argparse.ArgumentParser(description="Script params",
                                formatter_class=argparse.ArgumentDefaultsHelpFormatter)
  parser.add_argument("--user-dir", nargs='?', dest="userdir", default="", help="user data (default: %(default)s)")
  parser.add_argument("--log-dir", nargs='?', dest="logdir", default="", help="user data (default: %(default)s)")
  parser.add_argument("host", nargs='?', default="localhost", help="server hots (default: %(default)s)")
  parser.add_argument("port", nargs='?', default="8500", help="server port (default: %(default)s)")
  parser.add_argument("username", nargs='?', default="pgadmin", help="server user (default: %(default)s)")
  parser.add_argument("password", nargs='?', default="pgadmin", help="server password (default: %(default)s)")
  parser.add_argument("--app-dir", nargs='?', dest="appdir", default="./services", help="service path (default: %(default)s)")
  return parser.parse_known_args()

args, unknown = getArgs()


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

CONFIG.APP_SERVICE_POSTGRE_HOST = os.getenv("POSTGRE_HOST", "localhost")
CONFIG.APP_SERVICE_POSTGRE_PORT = os.getenv("POSTGRE_PORT", "8500")
CONFIG.APP_SERVICE_POSTGRE_AUTH_USERNAME = os.getenv("POSTGRE_AUTH_USERNAME", "pgadmin")
CONFIG.APP_SERVICE_POSTGRE_AUTH_PASSWORD = os.getenv("POSTGRE_AUTH_PASSWORD", "pgadmin")


Logger.info(CONFIG.toString())
