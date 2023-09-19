from typedb.client import *
from loguru import logger as Logger
from posixpath import basename
import json
from datetime import datetime
import os
import array

def getJsonValue(json, key, defaultValue = None):
  if key in json:
    return json[key]
  else:
    return defaultValue

@Logger.catch
def main(inputfile, outputfile):
  print(f'test text {inputfile}')
  if os.path.exists(inputfile):
      with open(inputfile, "r") as script_input:
          config = json.load(script_input)

  print(f'config {config}')

  connection = getJsonValue(config,'connection', {})
  query = getJsonValue(config,'query', {})
  topic = getJsonValue(config,'topic', {})

  print(f'connection {connection}')
  print(f'query {query}')
  print(f'topic {topic}')

  outputjson = {}
  typeDBConnect = f"{connection['dbhost']}:{connection['dbport']}"
  with TypeDB.core_client(typeDBConnect) as client:
      with client.session(connection['dbdatabase'], SessionType.DATA) as session:
          with session.transaction(TransactionType.READ) as read_transaction:
              answer_iterator = read_transaction.query().match(query['dbquery'])
              for answer in answer_iterator:
                dict_answer = answer.map()
                for key, thing in dict_answer.items():
                   if thing.is_entity():
                      outputjson[thing.get_iid()] = thing.get_type().get_label().name()

  with open(outputfile, "w") as outfile:
      json.dump(outputjson, outfile)
