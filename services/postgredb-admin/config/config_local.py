import os
import logging
DATA_DIR = os.getenv("DATA_DIR", "./data")
LOG_FILE = os.path.join(DATA_DIR, 'pgadmin4.log')
SQLITE_PATH = os.path.join(DATA_DIR, 'pgadmin4.db')
SESSION_DB_PATH = os.path.join(DATA_DIR, 'sessions')
STORAGE_DIR = os.path.join(DATA_DIR, 'storage')
CONSOLE_LOG_LEVEL = logging.INFO
FILE_LOG_LEVEL = logging.INFO
DEFAULT_SERVER_PORT = 8510
SERVER_MODE = False
