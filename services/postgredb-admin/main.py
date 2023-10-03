import sys
import os
import builtins
from loguru import logger as Logger

if __name__ == "__main__":
    # Logger.info("Environment variables:")
    # for k, v in os.environ.items():
    #   Logger.info(f'{k}={v}')

    # set logger level
    Logger.remove()
    Logger.add(sys.stdout, level="INFO")

    Logger.info("Resolve PGADMIN variables")
    PGADMIN_SCRIPT = os.getenv("PGADMIN_SCRIPT", "")
    PGADMIN_ROOT = os.getenv("PGADMIN_SCRIPT_HOME", "")
    Logger.info("PGADMIN exec script: " + PGADMIN_SCRIPT)
    Logger.info("PGADMIN root directory: " + PGADMIN_ROOT)
    Logger.info("Updating execution path")
    os.chdir(PGADMIN_ROOT)
    Logger.info("Execution path: " + os.getcwd())
    Logger.info("Python path: " + ";".join(sys.path))

    packages = os.path.realpath(os.getenv("PYTHONPATH", ""))
    appdata = os.path.realpath(os.getenv("SERVICE_HOME", ""))
    os.environ['APPDATA'] = appdata
    Logger.info("PYTHONPATH ENV: " + packages)
    os.environ['PYTHONHOME'] = sys.prefix
    os.environ['SCRIPT_NAME'] = '/pgAdmin4'

    Logger.info("PYTHONHOME SET: " + os.getenv("PYTHONHOME", ""))
    Logger.info("SCRIPT_NAME SET: " + os.getenv("SCRIPT_NAME", ""))

    Logger.info("Updating PYTHONPATH")
    if sys.path[0] != PGADMIN_ROOT:
        sys.path.insert(0, PGADMIN_ROOT)

    sys.path.insert(0, os.getenv("PYTHONPATH", ""))

    Logger.info("PYTHONPATH:")
    Logger.info(sys.path)

    # yeah... why not use env vars for this...
    if sys.platform.startswith('win32'):
        Logger.info("WIN32 - Set CommonProgramFiles to " + packages)
        os.environ['CommonProgramFiles'] = packages

    Logger.info("Setting SERVER_MODE to True")
    builtins.SERVER_MODE = True

    Logger.info("Importing PGAdmin4 Application")
    from pgAdmin4 import app as application

    Logger.info("Starting PGAdmin4 service")
    application.run(host=os.getenv("SERVICE_HOST", "localhost"), port=os.getenv("SERVICE_PORT", "8510"))

