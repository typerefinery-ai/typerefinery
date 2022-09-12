from __future__ import annotations
# allow importing og service local packages
import os
import sys

where_am_i = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, where_am_i+"/__packages__")
sys.path.append(where_am_i)
# end of local package imports


import json
from loguru import logger as Logger
from posixpath import basename
import argparse
from datetime import datetime

import copy
import random

def add_link_ref(nodes, node_id, type_label, link_index):
    # annotate node with link id (index in links list)
    local_node = nodes[node_id]
    local_list = []
    ##logger.debug('======================= adding link reference ==============================')
    ##logger.debug(f' the link index is {link_index}')
    ##logger.debug(f'node before is -> {local_node}')
    if type_label in local_node:
        ##logger.debug('already there')
        local_node[type_label].append(link_index)

    else:
        local_list.append(link_index)
        ##logger.debug(f'new list -> {local_list}')
        local_node[type_label] = local_list

    ##logger.debug(f'node after is -> {local_node}')
    return nodes

def annotate_nodes_groups(nodes, groups):
    # second annotate all nodes in group leaves
    for g_index, g_l in enumerate(groups):
        g_l['del'] = False
        if 'leaves' in g_l:
            g_g_leaves = g_l['leaves']
            for g_g_l in g_g_leaves:
                loc_node = nodes[g_g_l]
                if 'group_ref' in loc_node:
                    loc_node['group_ref'].append(g_index)

                else:
                    tmplist = []
                    tmplist.append(g_index)
                    loc_node['group_ref'] = tmplist

    return nodes, groups


def annotate_nodes(nodes, links):
    for i, l in enumerate(links):
        l['del'] = False
        source = l['source']
        target = l['target']
        l['orig_id'] = i
        nodes = add_link_ref(nodes, source, 'source_link', i)
        nodes = add_link_ref(nodes, target, 'target_link', i)

    return nodes, links



def process_leaves(g_leaves,nodes, links, groups, superc, link_source_check, link_target_check, loc_nodes):
    # for each node, mark delete and check links
    #logger.debug('-------------------- inside process leaves --------------------------------')
    #logger.debug(f'g_leaves is -> {g_leaves}')
    for l_n in g_leaves:
        #logger.debug(f'l_n is -> {l_n}')
        # mark delete
        nodes[l_n]['del'] = True
        # copy node id to list to check against source and target links
        loc_nodes.append(l_n)
        # get a copy of the node
        loc_node = copy.deepcopy(nodes[l_n])
        #logger.debug(f'loc_node is -> {loc_node}')
        superc['nodes'].append(loc_node)
        # get source links, then target and
        if 'source_link' in loc_node:
            loc_links = loc_node['source_link']
            #logger.debug(f'loc_links is -> {loc_links}')
            # for each, get a copy
            for sl in loc_links: # index number list of links using this node
                loc_link = links[sl] #??????????????????????????
                #logger.debug(f'loc_link is -> {loc_link}')
                if loc_link['target'] in loc_links:
                    # internal link, so mark to dekete and take  copy
                    links[sl]['del'] = True
                    superc['links'].append(copy.deepcopy(links[sl]))

                else:
                    # may be group or external link, put into check
                    link_target_check.append(sl)

        if 'target_link' in loc_node:
            loc_links = loc_node['target_link']
            #logger.debug(f'loc_links is -> {loc_links}')
            # for each, get a copy
            for sl in loc_links:
                loc_link = links[sl]
                #logger.debug(f'loc_link is -> {loc_link}')
                if loc_link['source'] in loc_links:
                    # internal link, so delete
                    links[sl]['del'] = True
                    superc['links'].append(copy.deepcopy(links[sl]))

                else:
                    # may be group or external link, put into check
                    link_source_check.append(sl)

    #logger.debug('----------------------- end of  process leaves ------------------------')
    return nodes, links, groups, superc, link_source_check, link_target_check, loc_nodes

def process_groups(loc_group, nodes, links, groups, superc, link_source_check, link_target_check, loc_nodes):
    # here we go
    g_g_leaves = []
    g_g_groups = []
    loc_group['del'] = True
    if 'leaves' in loc_group:
        g_g_leaves = loc_group['leaves']

    if 'groups' in loc_group:
        g_g_groups = loc_group['groups']

    if len(g_g_leaves) > 0:
                # Type 1,2 or 4 group
                nodes, links, groups, superc, link_source_check, link_target_check, loc_nodes = process_leaves(g_g_leaves, nodes, links, groups, superc, link_source_check, link_target_check, loc_nodes)

    if len(g_g_groups) > 0:
        # Type 2, 3, or 4
        # for each group, retrieve the leafs layer, and process as above
        for g_g in g_g_groups:
            loc_group = groups[g_g]
            superc['groups'].append(copy.deepcopy((loc_group)))
            nodes, links, groups, superc, link_source_check, link_target_check, loc_nodes = process_groups(loc_group, nodes, links, groups, superc, link_source_check, link_target_check, loc_nodes)

    return nodes, links, groups, superc, link_source_check, link_target_check, loc_nodes


def clean_records(nodes, links, groups):
    # first clean up the nodes

    nodes = [i for i in nodes if i['del'] == False ]

    # reset link ids and group ids
    for j, n in enumerate(nodes):
        if 'source_link' in n:
            source_list = n['source_link']
            for sl in source_list:
                link_sl = links[sl]
                link_sl['source'] = j

        if 'target_link' in n:
            source_list = n['target_link']
            for sl in source_list:
                link_sl = links[sl]
                link_sl['target'] = j

        if 'group_ref' in n:
            group_ref_list = n['group_ref']
            for grl in group_ref_list:
                grps_layer = groups[grl]
                if 'leaves' in grps_layer:
                    grps_leaves = grps_layer['leaves']
                    if n['id'] in grps_leaves:
                        grps_leaves.remove(n['id'])
                        grps_leaves.append(j)

        n['orig_id'] = n['id']
        n['id'] = j


    # clean up links
    links = [i for i in links if i['del'] == False ]

    # clean up groups
    groups = [i for i in groups if i['del'] == False ]

    return nodes, links, groups




def collapse_groups(collapsed, group_label, logger: Logger):
    nodes = collapsed['nodes']
    links = collapsed['links']
    groups = collapsed['groups']
    superg = []
    high = 100000
    low = 1000

    # annotate nodes with del = False first
    for n in nodes:
        n['del'] = False

    # annotate nodes with link ids
    nodes, links = annotate_nodes(nodes, links)
    # annotate nodes with groups ids
    nodes, groups = annotate_nodes_groups(nodes, groups)

    #logger.debug('============================ start loop ======================')
    #logger.debug(f'groups length {len(groups)}')

    for i, g in enumerate(groups):
        if g['label'] == group_label:
            #logger.debug(f'g is -> {g}')
            # ===========================================
            # parameter declarations
            # ================================================
            # super collection of everything to be deleted
            superc = {}
            superc['nodes'] = []
            superc['links'] = []
            superc['groups'] = []
            # collect details for the new super node
            new_node_layer = {}
            # local nodes list, collects nodes indexes for each iteration
            loc_nodes = []
            # list to store link ids to check
            link_target_check = []
            link_source_check = []
            # leaves and groups for this enumeration
            g_leaves = []
            g_groups = []
            # ======================================
            # process from here
            # ========================================
            g['del'] = True
            uniqueid = 'S' + str(random.randint(low, high))
            new_node_layer['G_id'] = uniqueid
            new_node_layer['G_name'] = g['label']
            new_node_layer['colour_list'] = g['colour_list']
            new_node_layer['level'] = g['level']
            # need stroke details
            #new_node_layer['colour_list'] = g['colour_list']
            #new_node_layer['level'] = g['level']
            new_node_layer['type'] = 'super'
            new_node_layer['id'] = len(nodes)
            new_node_layer['dtype'] = 'actual'
            new_node_layer['group_type'] = g['group_type']
            new_node_layer['del'] = False
            # add location if it is there
            if 'location' in g:
                new_node_layer['location'] = g['location']

            superc['groups'].append(copy.deepcopy(g))
            superc['key'] = uniqueid
            if 'leaves' in g:
                g_leaves = g['leaves']
                new_node_layer['leaf_description'] = g['leaf_description']

            if 'groups' in g:
                g_groups = g['groups']
                new_node_layer['group_description'] = g['group_description']

            if len(g_leaves) > 0:
                # Type 1,2 or 4 group
                #logger.debug('============================ going into leaves ======================')
                #logger.debug(f'leaves are -> {g_leaves}')
                nodes, links, groups, superc, link_source_check, link_target_check, loc_nodes = process_leaves(g_leaves,nodes, links, groups, superc, link_source_check, link_target_check, loc_nodes)

            if len(g_groups) > 0:
                #logger.debug('============================ going into groups ======================')
                #logger.debug(f'groups are -> {g_groups}')
                # Type 2, 3, or 4
                # for each group, retrieve the leafs layer, and process as above
                for g_g in g_groups:
                    loc_group = groups[g_g]
                    loc_group['del'] = True
                    superc['groups'].append(copy.deepcopy((loc_group)))
                    nodes, links, groups, superc, link_source_check, link_target_check, loc_nodes = process_groups(loc_group, nodes, links, groups, superc, link_source_check, link_target_check, loc_nodes)

            # now check link lists against loc_nodes to find only external links
            # first look to see if link sources are in the list of local nodes
            #logger.debug('============================ start summing up ======================')
            #logger.debug(f'link_source_check are -> {link_source_check}')
            #logger.debug(f'link_target_check are -> {link_target_check}')

            # remove marked links from link source check and link target check
            link_source_check = [i for i in link_source_check if links[i]['del'] != True]
            # look at the ones that ar left to see if they are cross group
            indexes = []
            for index, lsc in enumerate(link_source_check):
                loc_link = links[lsc]
                loc_link['del'] = False
                if loc_link['source'] in loc_nodes:
                    # internal link, so delete
                    superc['links'].append(copy.deepcopy((loc_link)))
                    links[lsc]['del'] = True
                    indexes.append(index)

            for index in sorted(indexes, reverse=True):
                del link_source_check[index]

            # second look to see if link targets are in the list of local nodes
            link_target_check = [i for i in link_target_check if links[i]['del'] != True]
            # look at the ones that ar left to see if they are cross group
            indexes = []
            for index, lsc in enumerate(link_target_check):
                loc_link = links[lsc]
                loc_link['del'] = False
                if loc_link['target'] in loc_nodes:
                    # internal link, so delete
                    superc['links'].append(copy.deepcopy((loc_link)))
                    links[lsc]['del'] = True
                    indexes.append(index)

            for index in sorted(indexes, reverse=True):
                del link_target_check[index]

            # now we are sure, that anything left in the link check lists, is an external edge, not internal

            # get index if i add on the super node
            new_index = len(nodes)


            # update the group records
            new_node_layer['group_ref'] = []
            is_upper_level = True
            for g_index, tg in enumerate(groups):
                # for each record in groups view record
                tg_groups = []
                tg_leaves = []
                if 'groups' in tg:
                    tg_groups = tg['groups']
                if 'leaves' in tg:
                    tg_leaves = tg['leaves']
                # check if the current group index, is in the groups list
                ##logger.debug('======================================')
                ##logger.debug(f'tg_groups is {tg_groups}')
                ##logger.debug(f'tg_leaves is {tg_leaves}')
                ##logger.debug(f'i is {i}')
                ##logger.debug('======================================')
                if i in tg_groups:
                    # then, we need to delete 'i' in the group reference, and insert the supernode in leaves
                    #logger.debug('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
                    #logger.debug(f'tg_groups is {tg_groups}')
                    #logger.debug(f'tg_leaves is {tg_leaves}')
                    #logger.debug(f'i is {i}')
                    #logger.debug('$$$$$$$$$$$$$$$$$$$$$$$$$$$')
                    if 'leaves' in tg:
                        tg_leaves.append(len(nodes))
                    else:
                        tmp_list = []
                        tmp_list.append(len(nodes))
                        tg['leaves'] = tmp_list

                    tg_groups.remove(i)
                    is_upper_level = False
                    #logger.debug(f'tg_leaves is {tg_leaves}')
                    #logger.debug('$$$$$$$$$$$$$$$$$$$$$$$$$$$')
                    new_node_layer['group_ref'].append(g_index)


            # change any target links to  super object
            if len(link_source_check) > 0:
                new_node_layer['target_link'] = []
                for lsc in link_source_check:
                    loc_link = links[lsc]
                    loc_link['target'] = new_index
                    new_node_layer['target_link'].append(lsc)

            # change any source links
            if len(link_target_check) > 0:
                new_node_layer['source_link'] = []
                for lsc in link_target_check:
                    loc_link = links[lsc]
                    loc_link['source'] = new_index
                    new_node_layer['source_link'].append(lsc)

            # add the new node in
            nodes.append(new_node_layer)
            # now add on the superseeded records layer
            superg.append(superc)

    nodes, links, groups = clean_records(nodes, links, groups)
    collapsed['nodes'] = nodes
    collapsed['links'] = links
    collapsed['groups'] = groups
    collapsed['super'] = superg

    return collapsed












@Logger.catch
def collapse(colagraph, group_label, logger: Logger):
    collapsed = copy.deepcopy(colagraph['grouped'])


    #logger.debug('--------------------------------------------------------------------')
    #logger.debug('|||||||||||||||||||||| Group Collapse 1 |||||||||||||||||||||||||||||')
    #logger.debug('--------------------------------------------------------------------')

    collapsed = collapse_groups(collapsed, group_label, logger)
    #colagraph['collapsed'] = collapsed




    with open("collapsed.json", "w") as outfile:
        json.dump(collapsed, outfile)

    return collapsed




@Logger.catch
def main(inputfile, outputfile, logger: Logger):

    # if inputfile exists, read it
    if os.path.exists(inputfile):

        with open(inputfile, 'r') as infile:
            colaGraph = json.load(infile)

        group_name = colaGraph['collapse_label']

        collapsed = collapse(colaGraph, group_name, logger)

        with open(outputfile, "w") as outfile:
            json.dump(collapsed, outfile)


@Logger.catch
def getArgs():

  parser = argparse.ArgumentParser(description="Script params",
                                formatter_class=argparse.ArgumentDefaultsHelpFormatter)
  parser.add_argument("inputfile", nargs='?', default=f"{basename(__file__)}.input", help="input file (default: %(default)s)")
  parser.add_argument("outputfile", nargs='?', default=f"{basename(__file__)}.output", help="output file (default: %(default)s)")
  return parser.parse_args()

if __name__ == '__main__':
  args = getArgs()
  # setup logger for init
  log = Logger
  log.remove()
  log.add(f'{basename(__file__)}.log', level="INFO")
  log.info(args)
  main(args.inputfile, args.outputfile, log)
