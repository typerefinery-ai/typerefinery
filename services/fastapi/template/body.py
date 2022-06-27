
from typedb.client import *
from loguru import logger as Logger
from posixpath import basename
import json
import os
import sys
import argparse
from datetime import datetime


@Logger.catch
def main(dbhost, dbport, dbdatabase, dbquery, outputfile, logger: Logger):

  outputjson = {}
  typeDBConnect = f'{dbhost}:{dbport}'
  with TypeDB.core_client(typeDBConnect) as client:
      with client.session(dbdatabase, SessionType.DATA) as session:
          with session.transaction(TransactionType.READ) as read_transaction:
              answer_iterator = read_transaction.query().match(dbquery)
              # TODO: process answer_iterator and fill outputjson wit yout data

  with open(outputfile, "w") as outfile:
      json.dump(outputjson, outfile)

  logger.info('================ Schema ==================')
  logger.info(f"{basic['G_types']}")
