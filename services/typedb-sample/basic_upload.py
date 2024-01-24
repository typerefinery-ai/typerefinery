# allow importing og service local packages
import os
import sys

where_am_i = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, where_am_i+"/__packages__")
sys.path.append(where_am_i)
# end of local package imports


import basic_logs as classic
import datetime
from typedb.driver import *
from loguru import logger
import argparse


def load_footprint_types(session):
    footprint_types = ['insert $a isa footType; $a "->";',
            'insert $b isa footType; $b "<-";',
            'insert $c isa footType; $c "||";',
            'insert $d isa footType; $d "#";']
    for foot in footprint_types:
        with session.transaction(TransactionType.WRITE) as write_transaction:
            insert_iterator = write_transaction.query.insert(foot)
            for concept_map in insert_iterator:
                concepts = concept_map.concepts()
                #logger.debug("Inserted an event with name: {0}".format(concepts[0].id))
            ## to persist changes, write transaction must always be committed (closed)
        write_transaction.commit()



def load_classic_logs(session, log, name):
    # setup the log entity
    typeql_insert = 'insert $a isa log, has logName "'+name+'";'
    with session.transaction(TransactionType.WRITE) as write_transaction:
        insert_iterator = write_transaction.query.insert(typeql_insert)
        for concept_map in insert_iterator:
            concepts = concept_map.concepts()
            #logger.debug("Inserted an event with name: {0}".format(concepts[0].id))
        ## to persist changes, write transaction must always be committed (closed)
        write_transaction.commit()
    # setup the trace relations
    logger.debug('====================== completed logname loading, now load log =======================================')

    for i, trace in enumerate(log):
        logger.debug(f' per log trace -> {trace}')
        prev_name = None
        for j, event_name in enumerate(trace):
            logger.debug('----------------------per trace ---------------------------------------------')
            trace_len = len(trace)
            #insert the event and trace on the log
            typeql_insert = 'match $a isa log, has logName "'+name+'";'
            typeql_insert += ' insert $b isa event, has eventName "'+event_name+'";'
            typeql_insert += '  $c (owner: $a, item: $b) isa trace, '
            typeql_insert += 'has traceId "'+name+str(i)+'", has index '+str(j)+';'
            logger.debug('typeql insert {typeql_insert}')
            with session.transaction(TransactionType.WRITE) as write_transaction:
                insert_iterator = write_transaction.query.insert(typeql_insert)
                for concept_map in insert_iterator:
                    concepts = concept_map.concepts()
                    #logger.debug("Inserted an event with name: {0}".format(concepts[0].id))
                    #logger.debug("Inserted an event with name: {0}".format(concepts[0].id))
                    ## to persist changes, write transaction must always be committed (closed)
                    logger.debug("------ Insert Trace Statement")
                    logger.debug(f"typeql --> {typeql_insert}")
                    logger.debug("------ Response")
                    for c in concepts:
                        if(c.is_attribute()):
                            logger.debug(c.get_value())
                        elif(c.is_relation()):
                            rel_id = c.get_iid()
                            logger.debug(f"relation id is {rel_id}")
                        else:
                            logger.debug(f"entity {c.get_iid()}")
                    logger.debug("------ End Trace Statement")

                write_transaction.commit()

            if prev_name:
                typeql_insert = 'match $a isa log, has logName "'+name+'";'
                typeql_insert += '  $b isa event, has eventName "'+prev_name+'";'
                typeql_insert += '  $c (owner: $a, item: $b) isa trace, '
                typeql_insert += 'has traceId "'+name+str(i)+'", has index '+str(j-1)+';'
                typeql_insert += '  $d isa event, has eventName "'+event_name+'";'
                typeql_insert += '  $e (owner: $a, item: $d) isa trace, '
                typeql_insert += 'has traceId "'+name+str(i)+'", has index '+str(j)+';'
                typeql_insert += 'insert  $f (owner: $a, input: $b, output: $d) isa follows; '
                with session.transaction(TransactionType.WRITE) as write_transaction:
                    insert_iterator = write_transaction.query.insert(typeql_insert)
                    for concept_map in insert_iterator:
                        concepts = concept_map.concepts()
                        #logger.debug("Inserted an event with name: {0}".format(concepts[0].id))
                        #logger.debug("Inserted an event with name: {0}".format(concepts[0].id))
                        ## to persist changes, write transaction must always be committed (closed)
                        logger.debug("------ Insert follows Relation Statement")
                        logger.debug(f"typeql --> {typeql_insert}")
                        logger.debug("------ Response")
                        for c in concepts:
                            if(c.is_attribute()):
                                logger.debug(c.get_value())
                            elif(c.is_relation()):
                                rel_id = c.get_iid()
                                logger.debug(f"relation id is {rel_id}")
                            else:
                                logger.debug(f"concept {c.get_iid()}")
                        logger.debug("------ End Statement")

                    write_transaction.commit()

            prev_name = event_name
            if j == trace_len - 1:
                # insert the dummy end of trace event
                typeql_insert = 'match $a isa log, has logName "'+name+'";'
                typeql_insert += '  $b isa event, has eventName "'+event_name+'";'
                typeql_insert += '  $c (owner: $a, item: $b) isa trace, '
                typeql_insert += 'has traceId "'+name+str(i)+'", has index '+str(j)+';'
                typeql_insert += '  $d isa event, has eventName "TraceStop";'
                typeql_insert += 'insert  $f (owner: $a, input: $b, output: $d) isa follows; '
                with session.transaction(TransactionType.WRITE) as write_transaction:
                    insert_iterator = write_transaction.query.insert(typeql_insert)
                    for concept_map in insert_iterator:
                        concept_map_list = concept_map.concepts()
                        for c_m in concept_map_list:
                            logger.debug(f"Inserted a concept with name: {c_m}")
                            #logger.debug("Inserted an event with name: {0}".format(concepts[0].id))
                            ## to persist changes, write transaction must always be committed (closed)
                            logger.debug("------ Insert follows Relation Statement")
                            logger.debug(f"typeql --> {typeql_insert}")
                            logger.debug("------ Response")
                            if(c_m.is_attribute()):
                                logger.debug(c.get_value())
                            elif(c_m.is_relation()):
                                rel_id = c.get_iid()
                                logger.debug(f"relation id is {rel_id}")
                            else:
                                logger.debug(f"entity {c.get_iid()}")
                            logger.debug("------ End Statement")

                    write_transaction.commit()




@logger.catch
def initialiselogs(server):
    typedb_connection = server["url"] + ":" + server["port"]
    with TypeDB.core_driver(typedb_connection) as client:
        with client.session(server["database"], SessionType.DATA) as session:
            # insert null event
            logger.info(" - insert null event")
            typeql_insert = 'insert  $a isa event, has eventName "TraceStop";'
            with session.transaction(TransactionType.WRITE) as write_transaction:
                    insert_iterator = write_transaction.query.insert(typeql_insert)
                    for concept_map in insert_iterator:
                        concept_map_list = concept_map.concepts()
                        for c_m in concept_map_list:
                            logger.debug(f"Inserted a concept with name: {c_m}")
                    ## to persist changes, write transaction must always be committed (closed)
                    write_transaction.commit()
            # insert the raw activity names
            logger.info(" - insert the raw activity names L1")
            #load_footlogger.debug_types(session)
            load_classic_logs(session, classic.L1,'L1')
            logger.info(" - insert the raw activity names L2")
            load_classic_logs(session, classic.L2,'L2')
            logger.info(" - insert the raw activity names L3")
            load_classic_logs(session, classic.L3,'L3')
            # logger.info(" - insert the raw activity names L4")
            # load_classic_logs(session, classic.L4,'L4')
            # logger.info(" - insert the raw activity names L5")
            # load_classic_logs(session, classic.L5,'L5')


def main():
    parser = argparse.ArgumentParser(description="Script params",
                                 formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument("--host", nargs='?', default="localhost", help="server host")
    parser.add_argument("--port", nargs='?', default="8729", help="server port")
    parser.add_argument("--db", nargs='?', default="typerefinery", help="server database")
    args = parser.parse_args()

    server = {
        "url": args.host,
        "port": args.port,
        "database": args.db
    }
    logger.info("======== Import Starting =========")
    initialiselogs(server)
    logger.info("======== Import Finished =========")


if __name__ == '__main__':
    main()
