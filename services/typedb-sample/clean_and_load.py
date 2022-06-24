from typedb.client import *
from loguru import logger
import json
import basic_upload as up
import os


@logger.catch
def clean_and_load(server):
    logger.debug("======================== Check if DB Exists and Clean ======================")
    host = server["url"] + ":" + server["port"]
    db_name = server["database"]
    with TypeDB.core_client(host) as client:
        # does the  db exist?
        logger.debug("---- client has started ------")
        db_exists = client.databases().contains(db_name)
        logger.debug(f'db exists is {db_exists}')
        # if db exists, then delete, else do nothing
        if (db_exists):
            logger.debug(f'the {db_name} database is being deleted')
            client.databases().get(db_name).delete()

        # in either case, create the new  database
        client.databases().create(db_name)
        # load the current schema file into a string
        with open(server["schema"], 'r') as f:
            schema_string = ""
            for line in f:
                if line.startswith('#'):
                    continue

                line = line.partition('#')[0]
                line = line + '\n'
                schema_string += line

        # now start  the schema writing transaction
        with client.session(db_name , SessionType.SCHEMA) as session:
            with session.transaction(TransactionType.WRITE) as write_transaction:
                define_iterator = write_transaction.query().define(schema_string)
                # logger.debug(f'Schema Define Statement - {schema_string}')
                logger.debug(f'::::::::::::::::::::::::::::::::')
                # logger.debug(f'define iterator -> {define_iterator}')
                
                        
                write_transaction.commit()


    logger.debug("=================== Start PM_4  Import ===========================")
    up.initialiselogs(server)
    logger.debug("=================== End PM_4 Import ===========================")


# if this file is run directly, then start here
if __name__ == '__main__':
    # define the database server and import details
    server = {
        "url": os.environ.get('TYPEDB_HOST', 'localhost'),
        "port": os.environ.get('TYPEDB_PORT', '1729'),
        "database": os.environ.get('TYPEDB_DB', 'pm_4'),
        "schema": "./schema/alpha2.tql"
    }
    
    
    # clean db and load all of the files in the director
    clean_and_load(server)
    