from typedb.client import *
from loguru import logger as Logger
from posixpath import basename
import json
from datetime import datetime


@Logger.catch
def main(argconfig, logger: Logger):
  config = {
      "dbhost": argconfig.dbhost,
      "port": argconfig.dbport,
      "database": argconfig.dbdatabase,
      "dbquery": argconfig.dbquery,
      "outputfile": argconfig.outputfile
  }
  logger.info(f"dbhost: {config.dbhost}")
  outputjson = {}
  typeDBConnect = f'{config.dbhost}:{config.dbport}'
  with TypeDB.core_client(typeDBConnect) as client:
      with client.session(config.dbdatabase, SessionType.DATA) as session:
          with session.transaction(TransactionType.READ) as read_transaction:
              answer_iterator = read_transaction.query().match(config.dbquery)
              # TODO: process answer_iterator and fill outputjson wit yout data

  with open(config.outputfile, "w") as outfile:
      json.dump(outputjson, outfile)
