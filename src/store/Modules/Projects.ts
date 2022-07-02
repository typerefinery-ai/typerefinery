/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"
const storeValue = localStorage.getItem("typerefinery")
const appDataInStore = storeValue ? JSON.parse(storeValue).AppData : false
@Module({
  name: "AppData",
  store: store,
  dynamic: true,
  preserveState: appDataInStore,
})
export default class AppData extends VuexModule {
  list: any = [
    {
      type: "projects",
      label: "Projects",
      icon: "",
      expanded: false,
      list: [
        {
          type: "project",
          id: "project1",
          label: "Project 1",
          description: "",
          icon: "",
          expanded: false,
          connections: {
            type: "connections",
            icon: "",
            expanded: true,
            list: [
              {
                type: "connection",
                id: "connection1",
                label: "connection 1",
                icon: "connection",
                description: "",
                port: "",
                host: "",
              },
            ],
          },
          queries: {
            type: "queries",
            icon: "",
            expanded: true,
            list: [
              {
                type: "query",
                id: "query1",
                label: "query 1",
                icon: "query",
                description: "",
                query: "",
                dataPath: "",
                connection: "connection1", // id
                transformer: {
                  type: "transformer",
                  id: "transformer1",
                  label: "transformer 1",
                  icon: "transformer",
                  scope: "local",
                  description: "",
                  code: "",
                  error: "",
                  logs: [""],
                },
                algorithm: {
                  type: "algorithm",
                  id: "algorithm1",
                  label: "algorithm 1",
                  icon: "algorithm",
                  scope: "local",
                  description: "",
                  code: `from typedb.client import *
from loguru import logger as Logger
from posixpath import basename
import json
import copy
import os
import sys
import argparse
from datetime import datetime
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
def collect_answers(answer_iterator, r_tx, logger: Logger):
    logger.info(f'into collect answers, iterator -> {answer_iterator}')
    res = []
    layers = []
    layer = []
    for answer in answer_iterator:
        dict_answer = answer.map()
        #logger.info(f'dict answer is {dict_answer}')
        for key, thing in dict_answer.items():
            logger.info(f'key, things is {key}, {thing}')
            # pull entity data
            if thing.is_entity():
                ent = {}
                ent['type'] = 'entity'
                ent['symbol'] = key
                ent['G_id'] = thing.get_iid()
                ent['G_name'] = thing.get_type().get_label().name()
                logger.info((f'entity name is {ent["G_name"]}'))
                logger.info((f'thing value is {thing}'))
                att_obj = thing.as_remote(r_tx).get_has()
                att = []
                for a in att_obj:
                    att.append(a.get_iid())
                ent['has'] = att
                res.append(ent)
                layer.append(ent)
                logger.info(f'ent -> {ent}')
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
                logger.info(f'att -> {att}')
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
                logger.info(f' links are -> {links}')
                edges = {}
                for edge_key, edge_thing in links.items():
                    logger.info(f' edge key is -> {edge_key}')
                    logger.info(f' edge_thing is -> {list(edge_thing)}')
                    edges[edge_key.get_label().name()] = [e.get_iid() for e in list(edge_thing)]
                rel['edges'] = edges
                res.append(rel)
                layer.append(rel)
                logger.info(f'rel -> {rel}')
            # else log out error condition
            else:
                logger.info(f'Error key is {key}, thing is {thing}')
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
def convert_res_to_graph(res, logger: Logger):
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
def convert_res_to_cola(nodes, edges, G_types, logger: Logger):
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
    logger.info(f"myUniqueSet:, {myUniqueSet}")
    G_types['schema'] = myUniqueSet
    logger.info('==========================================================================================')
    logger.info('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    logger.info(f'g-types is -> {G_types}')
    logger.info('==========================================================================================')
    logger.info('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    logger.info(f'nodes is ->  {nodes}')
    logger.info('==========================================================================================')
    logger.info('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    logger.info(f'edges is -> {edges}')
    logger.info('==========================================================================================')
    logger.info('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
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
@Logger.catch
def get_data(dbhost, dbport, dbdatabase, dbquery, logger: Logger):
    typeDBConnect = f'{dbhost}:{dbport}'
    with TypeDB.core_client(typeDBConnect) as client:
        with client.session(dbdatabase, SessionType.DATA) as session:
            with session.transaction(TransactionType.READ) as read_transaction:
                answer_iterator = read_transaction.query().match(dbquery)
                res = collect_answers(answer_iterator, read_transaction, logger)
                nodes, edges, G_types = convert_res_to_graph(res, logger)
                colaGraph = convert_res_to_cola(nodes, edges, G_types, logger)
    ## save file for reference
    # with open("g_to_webcola.json", "w") as outfile:
    #     json.dump(colaGraph, outfile)
    return colaGraph
@Logger.catch
def main(dbhost, dbport, dbdatabase, dbquery, outputfile, logger: Logger):
  # setup logger for execution
  colaGraph = get_data(dbhost, dbport, dbdatabase, dbquery, logger)
  basic = colaGraph['basic']
  with open(outputfile, "w") as outfile:
      json.dump(colaGraph, outfile)
  logger.info('================ Schema ==================')
  logger.info(f"{basic['G_types']}")
`,
                  error: "",
                  logs: [""],
                },
              },
              {
                type: "query",
                id: "query2",
                label: "query 2",
                icon: "query",
                description: "",
                query: "",
                dataPath: "",
                connection: "connection1", // id
                transformer: {
                  type: "transformer",
                  id: "transformer2",
                  label: "transformer 2",
                  icon: "transformer",
                  scope: "local",
                  description: "",
                  code: "",
                  error: "",
                  logs: [""],
                },
                algorithm: {
                  type: "algorithm",
                  id: "algorithm1",
                  label: "algorithm 1",
                  icon: "algorithm",
                  scope: "local",
                  description: "",
                  code: "",
                  error: "",
                  logs: [""],
                },
              },
            ],
          },
          transformers: {
            type: "tranformers",
            icon: "",
            expanded: true,
            list: [
              {
                type: "transformer",
                id: "transformer1",
                label: "transformer 1",
                icon: "transformer",
                scope: "local",
                description: "",
                code: `var svg = d3.select(wrapper).append("svg"),
				width = +svg.attr("width") || 960,
				height = +svg.attr("height") || 500
			  svg.attr("width", width).attr("height", height)
			  var color = d3.scaleOrdinal(d3.schemeCategory20)
			  var simulation = d3
				.forceSimulation()
				.force(
				  "link",
				  d3.forceLink().id(function (d) {
					return d.label
				  })
				)
				.force("charge", d3.forceManyBody())
				.force("center", d3.forceCenter(width / 2, height / 2))
			  d3.json(
				"/src/components/Transformer/D3/miserables.json",
				function (error, graph) {
				  if (error) throw error
				  var link = svg
					.append("g")
					.attr("class", "links")
					.selectAll("line")
					.data(graph.links)
					.enter()
					.append("line")
					.attr("stroke-width", function (d) {
					  return Math.sqrt(d.value)
					})
					.attr("stroke", "#999")
				  var node = svg
					.append("g")
					.attr("class", "nodes")
					.selectAll("circle")
					.data(graph.nodes)
					.enter()
					.append("circle")
					.attr("r", 5)
					.attr("fill", function (d) {
					  return color(d.group)
					})
					.call(
					  d3
						.drag()
						.on("start", dragstarted)
						.on("drag", dragged)
						.on("end", dragended)
					)
				  node.append("title").text(function (d) {
					return d.label
				  })
				  node.on("click", (e) => {
					self.nodeData = {
					  label: e.label,
					  index: e.index,
					}
				  })
				  simulation.nodes(graph.nodes).on("tick", ticked)
				  simulation.force("link").links(graph.links)
				  function ticked() {
					link
					  .attr("x1", function (d) {
						return d.source.x
					  })
					  .attr("y1", function (d) {
						return d.source.y
					  })
					  .attr("x2", function (d) {
						return d.target.x
					  })
					  .attr("y2", function (d) {
						return d.target.y
					  })
					node
					  .attr("cx", function (d) {
						return d.x
					  })
					  .attr("cy", function (d) {
						return d.y
					  })
				  }
				}
			  )
			  function dragstarted(d) {
				if (!d3.event.active) simulation.alphaTarget(0.3).restart()
				d.fx = d.x
				d.fy = d.y
			  }
			  function dragged(d) {
				d.fx = d3.event.x
				d.fy = d3.event.y
			  }
			  function dragended(d) {
				if (!d3.event.active) simulation.alphaTarget(0)
				d.fx = null
				d.fy = null
			  }`,
                error: "",
                logs: [""],
              },
              {
                type: "transformer",
                id: "transformer2",
                label: "transformer 2",
                icon: "transformer",
                scope: "local",
                description: "",
                code: "",
                error: "",
                logs: [""],
              },
            ],
          },
          algorithms: {
            type: "algorithms",
            icon: "",
            expanded: true,
            list: [
              {
                type: "algorithm",
                id: "algorithm1",
                label: "algorithm 1",
                icon: "algorithm",
                scope: "local",
                description: "",
                code: "",
                error: "",
                logs: [""],
              },
              {
                type: "algorithm",
                id: "algorithm2",
                label: "algorithm 2",
                icon: "algorithm",
                scope: "local",
                description: "",
                code: "",
                error: "",
                logs: [""],
              },
            ],
          },
        },
        {
          type: "project",
          id: "project2",
          label: "Project 2",
          description: "",
          icon: "",
          expanded: false,
          connections: {
            icon: "",
            expanded: true,
            list: [
              {
                type: "connection",
                id: "connection1",
                label: "connection 1",
                icon: "connection",
                scope: "local",
                description: "",
                port: "",
                host: "",
              },
              {
                type: "connection",
                id: "connection2",
                label: "connection 2",
                icon: "connection",
                scope: "local",
                description: "",
                port: "",
                host: "",
              },
            ],
          },
          queries: {
            icon: "",
            expanded: true,
            list: [
              {
                type: "query",
                id: "query1",
                label: "query 1",
                icon: "query",
                description: "",
                query: "",
                connection: "connection1", // id
                transformer: {
                  type: "transformer",
                  id: "transformer1",
                  label: "transformer 1",
                  icon: "transformer",
                  scope: "local",
                  description: "",
                  code: "",
                  error: "",
                  logs: [""],
                },
                algorithm: {
                  type: "algorithm",
                  id: "algorithm2",
                  label: "algorithm 2",
                  icon: "algorithm",
                  scope: "local",
                  description: "",
                  code: "",
                  error: "",
                  logs: [""],
                },
              },
              {
                type: "query",
                id: "query2",
                label: "query 2",
                icon: "query",
                description: "",
                query: "",
                connection: "connection1", // id
                transformer: {
                  type: "transformer",
                  id: "transformer2",
                  label: "transformer 2",
                  icon: "transformer",
                  scope: "local",
                  description: "",
                  code: "",
                  error: "",
                  logs: [""],
                },
                algorithm: {
                  type: "algorithm",
                  id: "algorithm2",
                  label: "algorithm 2",
                  icon: "algorithm",
                  scope: "local",
                  description: "",
                  code: "",
                  error: "",
                  logs: [""],
                },
              },
            ],
          },
          transformers: {
            icon: "",
            expanded: true,
            list: [
              {
                type: "transformer",
                id: "transformer1",
                label: "transformer 1",
                icon: "transformer",
                scope: "local",
                description: "",
                code: "",
                error: "",
                logs: [""],
              },
              {
                type: "transformer",
                id: "transformer2",
                label: "transformer 2",
                icon: "transformer",
                scope: "local",
                description: "",
                code: "",
                error: "",
                logs: [""],
              },
            ],
          },
          algorithms: {
            icon: "",
            expanded: true,
            list: [
              {
                type: "algorithm",
                id: "algorithm1",
                label: "algorithm 1",
                icon: "algorithm",
                description: "",
                code: "",
                error: "",
                logs: [""],
              },
              {
                type: "algorithm",
                id: "algorithm2",
                label: "algorithm 2",
                icon: "algorithm",
                description: "",
                code: "",
                error: "",
                logs: [""],
              },
            ],
          },
        },
      ],
    },
    {
      type: "connections",
      label: "Connections",
      icon: "",
      expanded: false,
      list: [
        {
          type: "connection",
          id: "connection1g",
          label: "connection 1",
          icon: "connection",
          scope: "global",
          description: "",
          port: "",
          host: "",
        },
        {
          type: "connection",
          id: "connection2g",
          label: "connection 2",
          icon: "connection",
          scope: "global",
          description: "",
          port: "",
          host: "",
        },
      ],
    },
    {
      type: "tranformers",
      label: "Tranformers",
      icon: "",
      expanded: false,
      list: [
        {
          type: "transformer",
          id: "transformer1g",
          label: "transformer 1",
          icon: "transformer",
          scope: "global",
          description: "",
          code: "",
          error: "",
          logs: [""],
        },
        {
          type: "transformer",
          id: "transformer2g",
          label: "transformer 2",
          icon: "transformer",
          scope: "global",
          description: "",
          code: "",
          error: "",
          logs: [""],
        },
      ],
    },
    {
      type: "algorithms",
      label: "Algorithms",
      icon: "",
      expanded: false,
      list: [
        {
          type: "algorithm",
          id: "algorithm1g",
          label: "algorithm 1",
          icon: "algorithm",
          scope: "global",
          description: "",
          code: "algorithm 1",
          error: "",
          logs: [""],
        },
        {
          type: "algorithm",
          id: "algorithm2g",
          label: "algorithm 2",
          icon: "algorithm",
          scope: "global",
          description: "",
          code: "algorithm 2",
          error: "",
          logs: [""],
        },
      ],
    },
  ]

  /**** Getters ****/
  // Data for Dropdown(List)
  get projectsList() {
    return this.list[0].list.map((el) => {
      return { label: el.label, key: el.id }
    })
  }

  // Actual Data
  get allProjects() {
    return this.list[0].list
  }

  get connectionsList() {
    return (projectIdx) => {
      return [
        {
          label: "Local",
          code: "local",
          items: this.list[0].list[projectIdx].connections.list.map((el) => {
            return { label: el.label, key: el.id }
          }),
        },
        {
          label: "Global",
          code: "global",
          items: this.list[1].list.map((el) => {
            return { label: el.label, key: el.id }
          }),
        },
      ]
    }
  }

  get localConnections() {
    return (projectIdx) => {
      return this.list[0].list[projectIdx].connections.list
    }
  }

  get globalConnections() {
    return this.list[1].list
  }

  get transformersList() {
    return (projectIdx) => {
      return [
        {
          label: "Local",
          code: "local",
          items: this.list[0].list[projectIdx].transformers.list.map((el) => {
            return { label: el.label, key: el.id, scope: el.scope }
          }),
        },
        {
          label: "Global",
          code: "global",
          items: this.list[2].list.map((el) => {
            return { label: el.label, key: el.id, scope: el.scope }
          }),
        },
      ]
    }
  }

  get localTransformers() {
    return (projectIdx) => {
      return this.list[0].list[projectIdx].transformers.list
    }
  }

  get globalTransformers() {
    return this.list[2].list
  }

  get algorithmsList() {
    return (projectIdx) => {
      return [
        {
          label: "Local",
          code: "local",
          items: this.list[0].list[projectIdx].algorithms.list.map((el) => {
            return { label: el.label, key: el.id, scope: el.scope }
          }),
        },
        {
          label: "Global",
          code: "global",
          items: this.list[3].list.map((el) => {
            return { label: el.label, key: el.id, scope: el.scope }
          }),
        },
      ]
    }
  }

  get localAlgorithms() {
    return (projectIdx) => {
      return this.list[0].list[projectIdx].algorithms.list
    }
  }

  get globalAlgorithms() {
    return this.list[3].list
  }

  // Query Transformer
  get transformerCode() {
    return (projectIdx: number, queryIdx: number) => {
      return this.list[0].list[projectIdx].queries.list[queryIdx].transformer
        .code
    }
  }

  get transformerError() {
    return (projectIdx: number, queryIdx: number) => {
      return this.list[0].list[projectIdx].queries.list[queryIdx].transformer
        .error
    }
  }

  get transformerConsoleMessage() {
    return (projectIdx: number, queryIdx: number) => {
      let myString = ""
      this.list[0].list[projectIdx].queries.list[
        queryIdx
      ].transformer.logs.forEach((el, i) => {
        if (i === 0) myString = JSON.stringify(el)
        else myString = myString + "\n" + JSON.stringify(el)
      })
      return (
        myString +
        "\n" +
        this.list[0].list[projectIdx].queries.list[queryIdx].transformer.error
      )
    }
  }

  // Query Algorithm
  get algorithmCode() {
    return (projectIdx: number, queryIdx: number) => {
      return this.list[0].list[projectIdx].queries.list[queryIdx].algorithm.code
    }
  }

  /**** Mutations ****/

  @Mutation
  addNewProject(project) {
    this.list[0].list.push(project)
  }

  @Mutation
  addNewQuery(queryData) {
    const { projectIdx, data } = queryData
    this.list[0].list[projectIdx].queries.list.push(data)
  }

  @Mutation
  updateQuery(data) {
    const { projectIdx, queryIdx, key, value } = data
    const appData = JSON.parse(JSON.stringify(this.list))
    appData[0].list[projectIdx].queries.list[queryIdx][key] = value
    this.list = appData
  }

  @Mutation
  addNewConnection(connectionData) {
    const { projectIdx, data } = connectionData
    if (projectIdx == -1) {
      // save globally
      this.list[1].list.push(data)
    } else {
      // save locally
      this.list[0].list[projectIdx].connections.list.push(data)
    }
  }

  @Mutation
  editConnection(connectionData) {
    const { projectIdx, connectionIdx, data } = connectionData
    const appData = JSON.parse(JSON.stringify(this.list))
    if (projectIdx == -1) {
      // update globally
      appData[1].list[connectionIdx] = data
    } else {
      // update locally
      appData[0].list[projectIdx].connections.list[connectionIdx] = data
    }
    this.list = appData
  }

  @Mutation
  addNewTransformer(transformerData) {
    const { projectIdx, data } = transformerData
    if (projectIdx == -1) {
      // save globally
      this.list[2].list.push(data)
    } else {
      // save locally
      this.list[0].list[projectIdx].transformers.list.push(data)
    }
  }

  @Mutation
  editTransformer(transformerData) {
    const { projectIdx, transformerIdx, data } = transformerData
    const appData = JSON.parse(JSON.stringify(this.list))
    if (projectIdx == -1) {
      // update globally
      appData[2].list[transformerIdx] = data
    } else {
      // update locally
      appData[0].list[projectIdx].transformers.list[transformerIdx] = data
    }
    this.list = appData
  }

  @Mutation
  addNewAlgorithm(algorithmData) {
    const { projectIdx, data } = algorithmData
    if (projectIdx == -1) {
      // save globally
      this.list[3].list.push(data)
    } else {
      // save locally
      this.list[0].list[projectIdx].algorithms.list.push(data)
    }
  }

  @Mutation
  editAlgorithm(algorithmData) {
    const { projectIdx, algorithmIdx, data } = algorithmData
    const appData = JSON.parse(JSON.stringify(this.list))
    if (projectIdx == -1) {
      // update globally
      appData[3].list[algorithmIdx] = data
    } else {
      // update locally
      appData[0].list[projectIdx].algorithms.list[algorithmIdx] = data
    }
    this.list = appData
  }

  @Mutation
  setQueryDataPath({ path, projectIdx, queryIdx }) {
    const appData = JSON.parse(JSON.stringify(this.list))
    appData[0].list[projectIdx].queries.list[
      queryIdx
    ].dataPath = `services/fastapi${path}`
    this.list = appData
  }

  // Query Transformer
  @Mutation
  setTransformerCode({ code, projectIdx, queryIdx }) {
    const appData = JSON.parse(JSON.stringify(this.list))
    appData[0].list[projectIdx].queries.list[queryIdx].transformer.code = code
    this.list = appData
  }

  @Mutation
  setTransformerError({ error, projectIdx, queryIdx }) {
    const appData = JSON.parse(JSON.stringify(this.list))
    appData[0].list[projectIdx].queries.list[queryIdx].transformer.error = error
    this.list = appData
  }

  @Mutation
  setTransformerLogs({ log, projectIdx, queryIdx }) {
    let logs: string
    if (typeof log == "object") {
      logs = JSON.stringify(log)
    } else if (typeof log != "string") return
    logs = log
    const appData = JSON.parse(JSON.stringify(this.list))
    appData[0].list[projectIdx].queries.list[queryIdx].transformer.logs.push(
      logs
    )
    this.list = appData
  }

  @Mutation
  clearTransformerLogs({ projectIdx, queryIdx }) {
    const appData = JSON.parse(JSON.stringify(this.list))
    appData[0].list[projectIdx].queries.list[queryIdx].transformer.logs = []
    this.list = appData
  }

  // Query Algorithm
  @Mutation
  setAlgoCode({ code, projectIdx, queryIdx }) {
    const appData = JSON.parse(JSON.stringify(this.list))
    appData[0].list[projectIdx].queries.list[queryIdx].algorithm.code = code
    this.list = appData
  }

  /* ---------------- Tree Nodes ---------------- */

  treeNodeClicked = false
  treeNodePath = ""
  selectedTreeNodes: { list: string[] } = {
    list: [],
  }

  @Mutation
  toggleTreeNode() {
    this.treeNodeClicked = !this.treeNodeClicked
  }

  @Mutation
  setSelectedTreeNodes(node: { id: string }) {
    const nodes = JSON.parse(JSON.stringify(this.selectedTreeNodes))
    nodes.list.push(node.id)
    nodes[node.id] = node
    this.selectedTreeNodes = nodes
  }

  @Mutation
  removeSelectedTreeNodes(id: string) {
    const nodes = JSON.parse(JSON.stringify(this.selectedTreeNodes))
    const idx = nodes.list.findIndex((el) => el == id)
    nodes.list.splice(idx, 1)
    delete nodes[id]
    this.selectedTreeNodes = nodes
  }

  @Mutation
  setTreeNodePath(nodePath: string) {
    this.treeNodePath = nodePath
  }

  @Mutation
  resetTreeNodePath() {
    this.treeNodePath = ""
  }

  /* ---------------- Dialogs ---------------- */

  queryDialog = false
  connectionDialog = false
  transformerDialog = false
  algorithmDialog = false

  @Mutation
  toggleQueryDialog() {
    this.queryDialog = !this.queryDialog
  }

  @Mutation
  toggleConnectionDialog() {
    this.connectionDialog = !this.connectionDialog
  }

  @Mutation
  toggleTransformerDialog() {
    this.transformerDialog = !this.transformerDialog
  }

  @Mutation
  toggleAlgorithmDialog() {
    this.algorithmDialog = !this.algorithmDialog
  }
}
