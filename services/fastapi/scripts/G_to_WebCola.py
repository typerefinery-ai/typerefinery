from typedb.client import *
from loguru import logger
import json
import copy
import os
import sys

logger.remove()
logger.add(sys.stderr, level="INFO")

gquery = "match $a isa log, has logName 'L1'; "
gquery += "$b isa event, has eventName $c;"
gquery += " $d (owner: $a, item: $b) isa trace, "
gquery += " has traceId $t, has index $f; offset 0; limit 100;"#  get; "

group_raw = [{
    "leaves": [
                    0
                ],
                "colour_list": "Greys",
                "level": 7,
                "label": "hidden"
}]


# function to collect all of the data out of the iterator
# with read transaction object to use asRemote mode
def collect_answers(answer_iterator, r_tx):
    logger.debug(f'into collect answers, iterator -> {answer_iterator}')
    res = []
    layers = []
    layer = []
    for answer in answer_iterator:
        dict_answer = answer.map()
        #logger.debug(f'dict answer is {dict_answer}')
        for key, thing in dict_answer.items():
            logger.debug(f'key, things is {key}, {thing}')
            # pull entity data
            if thing.is_entity():
                ent = {}
                ent['type'] = 'entity'
                ent['symbol'] = key
                ent['G_id'] = thing.get_iid()
                ent['G_name'] = thing.get_type().get_label().name()
                logger.debug((f'entity name is {ent["G_name"]}'))
                logger.debug((f'thing value is {thing}'))
                att_obj = thing.as_remote(r_tx).get_has()
                att = []
                for a in att_obj:
                    att.append(a.get_iid())

                ent['has'] = att
                res.append(ent)
                layer.append(ent)
                logger.debug(f'ent -> {ent}')

            # pull attribute data
            elif thing.is_attribute():
                att = {}
                att['type'] = 'attribute'
                att['symbol'] = key
                att['G_id'] = thing.get_iid()
                att['G_name'] = thing.get_type().get_label().name()
                att['value'] = thing.get_value()
                att['datatype'] = thing.get_type().get_value_type().name
                att_obj = thing.as_remote(r_tx).get_has()
                attrib = []
                for a in att_obj:
                    attrib.append(a.get_iid())

                att['has'] = attrib
                res.append(att)
                layer.append(att)
                logger.debug(f'att -> {att}')

            # pull relation data
            elif thing.is_relation():
                rel = {}
                rel['type'] = 'relation'
                rel['symbol'] = key
                rel['G_id'] = thing.get_iid()
                rel['G_name'] = thing.get_type().get_label().name()
                att_obj = thing.as_remote(r_tx).get_has()
                att = []
                for a in att_obj:
                    att.append(a.get_iid())

                rel['has'] = att
                links = thing.as_remote(r_tx).get_players_by_role_type()
                logger.debug(f' links are -> {links}')
                edges = {}
                for edge_key, edge_thing in links.items():
                    logger.debug(f' edge key is -> {edge_key}')
                    logger.debug(f' edge_thing is -> {list(edge_thing)}')
                    edges[edge_key.get_label().name()] = [e.get_iid() for e in list(edge_thing)]

                rel['edges'] = edges
                res.append(rel)
                layer.append(rel)
                logger.debug(f'rel -> {rel}')

            # else log out error condition
            else:
                logger.debug(f'Error key is {key}, thing is {thing}')

        layers.append(layer)

    return res

# function to filter the links, so that there are none pointing to data not included
def filter_links(reduced_at, reduced_en, re):
    #first build list of all node id's
    att_list = [e['G_id'] for e in reduced_at]
    ent_list = [e['G_id'] for e in reduced_en]
    rel_list = [e['G_id'] for e in re]
    node_list = att_list + ent_list + rel_list
    #check each input list to delete those not in node_list
    for item in reduced_en:
        for link in item['has']:
            if link not in node_list:
                item['has'].remove(link)

    for item in re:
        for link in item['has']:
            if link not in node_list:
                item['has'].remove(link)

    return reduced_at, reduced_en, re


# function to convert the list of results into nodes and edges
def convert_res_to_graph(res):
    edges = []
    nodes = []
    en = [e for e in res if e['type'] == 'entity']
    at = [e for e in res if e['type'] == 'attribute']
    re = [e for e in res if e['type'] == 'relation']
    # remove duplicates from attributes
    reduced_at = [v for i,v in enumerate(at) if v not in at[i+1:] ]
    reduced_en = [v for i,v in enumerate(en) if v not in en[i+1:] ]
    # find number of types
    G_types = {}
    G_types['entity'] = list(set([v['G_name'] for v in reduced_en]))
    G_types['attribute'] = list(set([v['G_name'] for v in reduced_at]))
    G_types['relation'] = list(set([v['G_name'] for v in re]))
    #filter out has links due to variables given thing, or attributes not expressed in the original query
    reduced_at, reduced_en, re = filter_links(reduced_at, reduced_en, re)
    # build edges list for attributes
    for e in reduced_en:
        own = e['has']
        source = e['G_id']
        name = 'has'
        for o in own:
            edge = {}
            edge['G_target'] = o
            edge['role'] = name
            edge['G_source'] = source
            edges.append(edge)

    for a in reduced_at:
        own = a['has']
        source = a['G_id']
        name = 'has'
        for o in own:
            edge = {}
            edge['G_target'] = o
            edge['role'] = name
            edge['G_source'] = source
            edges.append(edge)

    for r in re:
        own = r['has']
        source = r['G_id']
        name = 'has'
        for o in own:
            edge = {}
            edge['G_target'] = o
            edge['role'] = name
            edge['G_source'] = source
            edges.append(edge)

    # add edges from relations
    for r in re:
        source = r['G_id']
        edge_dict = r['edges']
        for k, e in edge_dict.items():
            edge = {}
            edge['G_target'] = e[0]
            edge['role'] = k
            edge['G_source'] = source
            edges.append(edge)

    # add all nodes together
    nodes = reduced_en + reduced_at + re
    for node in nodes:
        node['dtype'] = 'actual'


    return nodes, edges, G_types

def get_node_id(nodes, G_id):
    for index, element in enumerate(nodes):
        if element['G_id'] == G_id:
            return index;


def convert_res_to_cola(nodes, edges, G_types):
    # convert edges to id
    for edge in edges:
        edge['target'] = get_node_id(nodes, edge['G_target'])
        edge['source'] = get_node_id(nodes, edge['G_source'])

    for index, element in enumerate(nodes):
        element['id'] = index

    # find actual attributes in edges
    att_list = []
    for index, node in enumerate(nodes):
        if node['type'] == 'attribute':
            att_list.append(index)


    for edge in edges:
        edge['is_act_Attr'] = False
        for att in att_list:
            if edge['target'] == att or edge['source'] == att:
                edge['is_act_Attr'] = True
                break

    temp_edges = copy.deepcopy(edges)
    for t_edge in temp_edges:
        target_node = nodes[t_edge['target']]
        t_edge['target_name'] = target_node['G_name']
        source_node = nodes[t_edge['source']]
        t_edge['source_name'] = source_node['G_name']
        if t_edge['role'] == 'has' or source_node['type'] == 'relation':
            t_edge['direction'] = 'down'
        else:
            t_edge['direction'] = 'up'

        t_edge.pop('target')
        t_edge.pop('source')
        t_edge.pop('G_target')
        t_edge.pop('G_source')
        t_edge.pop('is_act_Attr')


    myUniqueSet = [dict(s) for s in set(frozenset(myObject.items()) for myObject in temp_edges)]
    logger.debug(f"myUniqueSet:, {myUniqueSet}")
    G_types['schema'] = myUniqueSet

    logger.debug('==========================================================================================')
    logger.debug('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    logger.debug(f'g-types is -> {G_types}')
    logger.debug('==========================================================================================')
    logger.debug('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    logger.debug(f'nodes is ->  {nodes}')
    logger.debug('==========================================================================================')
    logger.debug('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    logger.debug(f'edges is -> {edges}')
    logger.debug('==========================================================================================')
    logger.debug('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')


    colaGraph = {}
    basic = {}
    basic['nodes'] = nodes
    basic['links'] = edges
    basic['G_types'] = G_types
    basic['groups'] = []
    basic['constraints'] = []
    colaGraph['basic'] = basic
    colaGraph['grouped'] = {}

    return colaGraph

@logger.catch
def get_data(gConnect):
    g_uri = gConnect['url'] + ':' + gConnect['port']
    with TypeDB.core_client(g_uri) as client:
        with client.session(gConnect['database'], SessionType.DATA) as session:
            with session.transaction(TransactionType.READ) as read_transaction:
                answer_iterator = read_transaction.query().match(gConnect['gQuery'])
                logger.debug((f'have read the query -> {answer_iterator}'))
                res = collect_answers(answer_iterator, read_transaction)
                nodes, edges, G_types = convert_res_to_graph(res)
                colaGraph = convert_res_to_cola(nodes, edges, G_types)

    ## save file for reference
    # with open("g_to_webcola.json", "w") as outfile:
    #     json.dump(colaGraph, outfile)
    return colaGraph


@logger.catch
def main(gConnect):

    colaGraph = get_data(gConnect)
    basic = colaGraph['basic']

    with open("colaGraph_sample.json", "w") as outfile:
        json.dump(colaGraph, outfile)

    logger.debug('================ Schema ==================')
    logger.debug(f"{basic['G_types']}")





def_gConnect = {
        "url": os.environ.get('TYPEDB_HOST', 'localhost'),
        "port": os.environ.get('TYPEDB_PORT', '1729'),
        "database": os.environ.get('TYPEDB_DB', 'pm_4'),
        "gQuery": gquery
      }





if __name__ == '__main__':
    main(def_gConnect)
