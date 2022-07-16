from __future__ import annotations
# allow importing og service local packages
import os
import sys

where_am_i = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, where_am_i+"/__packages__")
sys.path.append(where_am_i)
# end of local package imports

from typedb.client import *
from loguru import logger as Logger
from posixpath import basename
import argparse
from datetime import datetime

import json
from itertools import groupby
from operator import itemgetter
import copy
import os
gquery = "match $a isa log, has logName $log; "
gquery += "$b isa event, has eventName $c;"
gquery += " $d (owner: $a, item: $b) isa trace, "
gquery += " has traceId $t, has index $f;  get; "

counter = 0


def add_main_leaf(node, nodes, links):
    if node['type'] == 'attribute' and node['dtype'] == 'actual':
        # add shadow copy
        shadow = copy.deepcopy(node)
        shadow['dtype'] = 'shadow'
        shadow['is_act_Attr'] = False
        global counter
        counter = counter + 1
        shadow['G_id'] = node['G_id'] + '-' + str(counter)
        shadow['id'] = nodes.count
        nodes.append(shadow)
        return shadow['id'], nodes, links

    else:
        # return the id only
        return node['id'], nodes, links


def get_string_repr(node):
    # we know it is an attribute
    if node['datatype'] == 'STRING':
        return '"' + node['value'] + '"'
    else:
        return node['value']


def get_V_group(colaGraph, group_def):
    leaves_q = group_def['leaves']
    groups_q = group_def['groups']
    constraints_q = group_def['constraints']
    results = group_def['results']
    ops = group_def['ops']


    # split leaves definitions into pieces
    if len(leaves_q) > 0:
        leaf_main = leaves_q[0]
        if len(leaves_q) > 1:
            leaf_secondary = leaves_q[1:]
        else:
            leaf_secondary = []

    else:
        leaf_main = []
        leaf_secondary = []

    # log the group definition
    #logger.debug('==============================================================')
    #logger.debug(f' leaves are {leaves_q}')
    #logger.debug(f'main leaf {leaf_main}, leaf second is {leaf_secondary}')
    #logger.debug(f' groups are {groups_q}')
    #logger.debug(f' constraints are {constraints_q}')
    #logger.debug('==============================================================')


    # references for the grouping data
    grouped = colaGraph['grouped']
    nodes = grouped['nodes']
    links = grouped['links']
    details = grouped['G_types']
    groups = grouped['groups']
    # references for the original data
    base = colaGraph['basic']
    origin = base['nodes']
    # setup constraints data structure
    if 'constraints' in grouped:
        constraints = grouped['constraints']
    else:
        constraints = []

    # references for the constraints_q definition
    # variables to hold the details from the definition
    align_x = {}
    align_y = {}
    from_to = []
    useConstraints = False
    if 'align_x' in constraints_q:
        #logger.debug(f'align x {constraints_q}')
        align_x = constraints_q['align_x']
        useConstraints = True
    else:
        align_x = {}

    if 'align_y' in constraints_q:
        #logger.debug(f'align y in {constraints_q}')
        align_y = constraints_q['align_y']
        useConstraints = True
    else:
        align_y = {}

    if 'from_to' in constraints_q:
        #logger.debug(f'from_to in {constraints_q}')
        from_to = constraints_q['from_to']
        useConstraints = True
    else:
        from_to = []

    #logger.debug(f'use constraints is {useConstraints}')

    # Are there special measurements, location, time etc?

    if 'location' in ops:
        location_schema = ops['location']
        locations = []
        #logger.debug(f'=======================================================')
        #logger.debug(f'location schema is {location_schema}')





    # Step 1: find all of the leaves and add to the group_def results first
    if len(leaves_q) > 0:
        for node_index, node in enumerate(origin):
            leaves = []
            layer_constraints = []
            description = []
            desc_layer = {}
            main_leaf_index = -1
            main_leaf_name = ''
            if 'location' in ops:
                location_layer = {}
                #logger.debug(f'======================= Setting up location layer ================================')
                #logger.debug(f'location schema is {location_schema}')
                #logger.debug(f'location layer is {location_layer}')

            # if there is a leaf, then
            if len(leaf_main) > 0:
                # add the main leaf
                if node['G_name'] == leaf_main['G_name']:
                    # top description record is title
                    desc_layer["title"] = ops["label"]
                    description.append(desc_layer)
                    desc_layer = {}
                    # find the first leaf
                    id1, nodes, links = add_main_leaf(node, nodes, links)
                    # get index and name for us in constraints
                    main_leaf_name = node['G_name']
                    # varaibales to hold the local constraints
                    loc_align_x = {
                        "type": "alignment",
                        "axis": "x",
                        "offsets": [], "g_type": "server", "c_type": "align_x"
                    }
                    loc_align_y = {
                        "type": "alignment",
                        "axis": "y",
                        "offsets": [], "g_type": "server", "c_type": "align_y"
                    }
                    loc_offsets_x = []
                    loc_offsets_y = []
                    loc_from_to_x = {}
                    loc_from_to_y = {}
                    local_from_to = []
                    if useConstraints:
                        #logger.debug('************* Adding constraints ************************')
                        if align_x != {}:
                            # do align x stuff here
                            x_offsets = align_x['offsets']
                            for x_off in x_offsets:
                                if x_off['node'] == main_leaf_name:
                                    # record this main in the x-axis record
                                    loc_layer = {}
                                    loc_layer['node'] = id1
                                    loc_layer['offset'] = x_off['offset']
                                    loc_offsets_x.append(loc_layer)
                        else:
                            align_x={}

                        if align_y != {}:
                            # do align y stuff here
                            y_offsets = align_y['offsets']
                            for y_off in y_offsets:
                                if y_off['node'] == main_leaf_name:
                                    # record this main in the x-axis record
                                    loc_layer = {}
                                    loc_layer['node'] = id1
                                    loc_layer['offset'] = y_off['offset']
                                    loc_offsets_y.append(loc_layer)
                        else:
                            align_y={}


                        #logger.debug('=============== my extracted constraints ========================')
                        #logger.debug('align x is -> ',align_x )
                        #logger.debug('align y is -> ',align_y )
                        #logger.debug('from_to is -> ',from_to )
                                #
                    # second description record is main leaf
                    desc_layer["type"] = node["type"]
                    desc_layer["name"] = node['G_name']
                    desc_layer["value"] = node['G_id'] if node['type'] != 'attribute' else get_string_repr(node)
                    description.append(desc_layer)
                    desc_layer = {}
                    i=0
                    #logger.debug(f'going through main leaf where i = {i}, node G_name = {node["G_name"]}, id1 = {id1}')
                    i=i+1
                    leaves.append(id1)
                    # add the secondary leaves
                    if len(leaf_secondary) > 0:
                        j=0
                        for sec_leaf_index, leaf in enumerate(leaf_secondary):
                            id2, nodes, links = add_secondary_leaf(id1, leaf, nodes, links)
                            lnode = nodes[id2]
                            lnode_name = lnode['G_name']
                            # if locations, then check if it is a location and write in the value
                            if 'location' in ops:
                                locallon = 0
                                locallat = 0
                                #logger.debug(f'===================== Adding locations ==================================')
                                #logger.debug(f'location schema is {location_schema}')
                                #logger.debug(f'location layer is {location_layer}')
                                #logger.debug(f'node is {lnode}')
                                if location_schema['lon'] == lnode_name:
                                    location_layer['lon'] = lnode['value']

                                if location_schema['lat'] == lnode_name:
                                    location_layer['lat'] = lnode['value']

                                #logger.debug(f'afterwards, location layer is {location_layer}')

                            # setup constraints
                            if useConstraints:
                                #logger.debug('************* Adding constraints ************************')
                                # setup from_to conbstraints raw variables
                                if  align_x!={}:
                                    # do align x stuff here
                                    x_offsets = align_x['offsets']
                                    for x_off in x_offsets:
                                        if lnode_name == x_off['node']:
                                            # record this main in the x-axis record
                                            loc_layer = {}
                                            loc_layer['node'] = id2
                                            loc_layer['offset'] = x_off['offset']
                                            loc_offsets_x.append(loc_layer)

                                else:
                                    align_x={}

                                if align_y!={}:
                                    # do align y stuff here
                                    y_offsets = align_y['offsets']
                                    for y_off in y_offsets:
                                        if lnode_name == y_off['node']:
                                            # record this main in the x-axis record
                                            loc_layer = {}
                                            loc_layer['node'] = id2
                                            loc_layer['offset'] = y_off['offset']
                                            loc_offsets_y.append(loc_layer)

                                    loc_align_x['offsets'] = loc_offsets_y
                                    constraints.append(loc_align_x)

                                else:
                                    align_y={}

                                if from_to != []:
                                    # do align y stuff here
                                    for f_to in from_to:
                                        if f_to['left'] == main_leaf_name and f_to['right'] == lnode['G_name']:
                                            loc_from_to_x = {'axis':'x', "g_type": "server", "c_type": "from_to"}#, "equality":"true"
                                            loc_from_to_x['left'] = id1
                                            loc_from_to_x['right'] = id2
                                            loc_from_to_x['gap'] = f_to['gap']
                                            #local_from_to.append(loc_from_to_x)
                                            #constraints.append(loc_from_to_x)
                                            loc_from_to_y = {'axis':'y', "g_type": "server", "c_type": "from_to"} #, "equality":"true"
                                            loc_from_to_y['left'] = id1
                                            loc_from_to_y['right'] = id2
                                            loc_from_to_y['gap'] = f_to['gap']
                                            #local_from_to.append(loc_from_to_y)
                                            #constraints.append(loc_from_to_y)

                                else:
                                    from_to = []


                            # write in the location fields
                            if 'location' in ops:
                                locations.append(location_layer)

                            # third and rest of description records are secondary leaves
                            desc_layer["type"] = lnode["type"]
                            desc_layer["name"] = lnode['G_name']
                            desc_layer["value"] = lnode['G_id'] if lnode['type'] != 'attribute' else get_string_repr(lnode)
                            desc_layer["role"] = leaf['role']
                            description.append(desc_layer)
                            desc_layer = {}
                            #logger.debug(f'going through second leaf where j = {j}, node G_name = {node["G_name"]}, id1 = {id1}, id2 = {id2}')
                            leaves.append(id2)

                    # add the results into the group_def record
                    #logger.debug('######################### Added up secondary leaves and constraints ############################')
                    #logger.debug(f'leaves are -> {leaves}')
                    #logger.debug('--------------------------------------------------------------------------')
                    #logger.debug('x align constraints -> ',loc_offsets_x )
                    #logger.debug('y align constraints -> ',loc_offsets_y )
                    #logger.debug('from-to constraints -> ',local_from_to )
                    loc_align_x["offsets"] = loc_offsets_x
                    loc_align_y["offsets"] = loc_offsets_y
                    # add constraints together
                    if local_from_to != []:
                        layer_constraints = local_from_to
                        if loc_offsets_x != []:
                            layer_constraints.append(loc_align_x)

                        if loc_offsets_y != []:
                            layer_constraints.append(loc_align_y)

                    else:
                        if loc_offsets_x != []:
                            layer_constraints.append(loc_align_x)

                        if loc_offsets_y != []:
                            layer_constraints.append(loc_align_y)


                    group_type = 'group_of_leaves'
                    #logger.debug('=============================== end of secondary leaves =============================================')
                    #logger.debug(' the constraints are -> ',layer_constraints )
                    results.append({'leaves': leaves, 'leaf_description': description, 'group_type' : group_type, 'constraints_layer' : layer_constraints})

    #logger.debug('****************************** Step 2A **********************************************')
    # Step 2-A: if there are leaves from the first stage, and groups defined, add them together
    # assume = groups are related to a G_name in a leaf through a role
    if len(leaves_q) > 0 and len(groups_q) > 0:
        # for each leaves_def result, find the correct groups and add them
        for r in results:
            # find the right group definition record to add
            for gq in groups_q:
                # leaf means look in group's leaves
                if gq['condition'] == 'leaf':
                    # get the groups data for this query
                    r['group_type'] = 'leaves_to_group'
                    r =  add_leaf_to_group_id(r, gq, nodes, links, ops)

                 # main leaf is linked to one or more groups inside another group
                elif gq['condition'] == 'group':
                    # get the groups data for this query
                    ##logger.debug(f'the gq is -> {gq}')
                    r['group_type'] = 'leaves_to_group_of_groups'
                    r =  add_leaf_to_g_of_g_id(r, gq, nodes, links, ops)
                else:
                    # bad condition
                    logger.debug(f'bad condition -> {gq["condition"]}')



    # Step 2-B: If there are groups but no leaves (i.e. groups of groups), then add them
    if len(leaves_q) == 0 and len(groups_q) > 0:
        # logger.debug('______________________________ Step 2B _____________________________________________________')
        if groups_q[0]['condition'] == 'value':
            results = add_group_of_groups(results, nodes, links, groups_q[0], ops)

        if groups_q[0]['condition'] == 'type':
            results = add_group_of_attributes(results, nodes, links, groups_q[0])
            #logger.debug(f' the resulting results are {results}')


    # add new leaves and groups records to existing, increase the group indexes to accomodate new leaves
    if len(groups) > 0 and len(results) > 0:
        # change any existing group index values to fit in the new leaves
        index_change_value = len(results)
        #logger.debug(f' need to add {index_change_value} to the index value of group definitions')
        # change any existing group index values in groups to fit in the new leaves
        for g in groups:
            if 'groups' in g:
                # add index-change_value to indexes in the groups list
                new_list = [x+index_change_value for x in g['groups']]
                g['groups'] = new_list

        # change any new group index values in results to fit in the new leaves
        # plus add group ops details, color, color index, description
        for r_index, r in enumerate(results):
            if 'groups' in r:
                # add index-change_value to indexes in the groups list
                new_list = [x+index_change_value for x in r['groups']]
                r['groups'] = new_list

            # add the ops details in the definition to each row
            r['colour_list'] = ops['colour_list']
            r['level'] = ops['level']
            r['label'] = ops['label']
            if 'location' in ops:
                r['location'] = locations[r_index]

        # now add both datasets together
        groups = results + groups

    else:
        #  add group ops details, color, color index, description
        for r in results:
            # add the ops details in the definition to each row
            r['colour_list'] = ops['colour_list']
            r['level'] = ops['level']
            r['label'] = ops['label']
        # just add results to colaGroup
        groups = results

    # setup the groups definition group field to be a string and not a nested object
    #if len(groups_q) > 0:
     #   nested_group_name = ''
      #  for group_details in groups_q:
       #     if 'group' in group_details:
        #        nested_group_name = group_details['ops']['name']

    #group_def['groups']['group'] = nested_group_name
    group_def['results'] = results
    grouped['nodes'] = nodes
    grouped['links'] = links
    grouped['groups'] = groups
    grouped['constraints'] = constraints
    colaGraph['grouped'] = grouped
    return colaGraph, group_def

def add_group_of_attributes(results, nodes, links, gq):
    attr_list = []
    results_layer = {}
    results_list = []
    for index, node in enumerate(nodes):
        if node['type'] == 'attribute' and node['dtype'] == 'actual':
            attr_list.append(index)

    #logger.debug(f'the list of attributes are {attr_list}')
    results_layer['leaves'] = attr_list
    results_list.append(results_layer)
    return results_list



def add_group_of_groups(results, nodes, links, gq, ops):
    # setup the local list
    #logger.debug('############################## Start Group By Value #################################')
    local_list = []
    for index, node in enumerate(nodes):
        layer = {}
        lnodes = []
        if node['G_name'] == gq['g_G_name']:
            # assume edge is down, so edge is a 'has', or head is a relation
            for link in links:
                if link['source'] == index and link['role'] == gq['g_role']:
                    vtail = link['target']
                    vnode = nodes[vtail]
                    if vnode['G_name'] == gq['v_G_name']:
                        lnodes.append(index)
                        lnodes.append(vtail)
                        layer['lnodes'] = lnodes
                        layer['vG_id'] = link['G_target']
                        layer['value'] = vnode['value']
                        local_list.append(layer)
                        break

    #logger.debug(f'the local list is {local_list}')
    #logger.debug('############################## End Group By Value #################################')
    gq_rec = gq['group']
    gq_rec_ops = gq_rec['ops']
    gq_data = gq_rec['results']
    # now, we have the list of nodes in each group, now we group them and determine
    sorted_list = sorted(local_list, key = itemgetter('vG_id'))
    #logger.debug(f'the sorted list is {sorted_list}')
    results = []
    for key, v_list in groupby(sorted_list, key = itemgetter('vG_id')):
        # v_list is a generator, so make a copy
        v_list_copy = list(v_list)
        # for each key, find each line in gq_data that corresponds to an line in v_list
        group_description_list = []
        group_description_layer = {}
        group_description_layer['title'] = ops["label"]
        group_description_list.append(group_description_layer)
        group_description_layer = {}
        group_description_layer['number'] = len(v_list_copy)
        group_description_layer['subtitle'] = gq_rec_ops['label']
        group_description_list.append(group_description_layer)
        group_description_layer = {}
        group_description_layer['condition_v_G_name'] = gq['v_G_name']
        group_description_layer['condition_g_G_name'] = gq['g_G_name']
        group_description_layer['condition_g_role'] = gq['g_role']
        group_description_layer['condition_value'] = v_list_copy[0]['value']
        group_description_list.append(group_description_layer)
        layer = {}
        for v_item in v_list_copy:
            # for each v_item, find the line in the groups record where the leaves are listed
            v_nodes = v_item['lnodes']
            for g_key, gq_d in enumerate(gq_data):
                # g_key is the index to the nested groups list
                if 'leaves' in gq_d:
                    gq_leaves = gq_d['leaves']
                    correct =  all(elem in gq_leaves for elem in v_nodes)
                    if correct:
                        # collect the index number
                        #logger.debug(f'%%%%%%%%% leaves are {gq_d}')
                        layer = add_group_id(layer, g_key)
                        break

        layer['group_type'] = 'group_of_groups'
        layer['group_description'] = group_description_list
        results.append(layer)

    #logger.debug(f'group records are {results}')

    return results


def add_group_id(r, gq_index):
    # test if groups list is there or not
    local_list = []
    if 'groups' in r:
        # add the id to the existing list
        r['groups'].append(gq_index)
        #logger.debug(f'*** in the if loop for add group, r is {r}, and gq_index is {gq_index}')
    else:
        # else define the list
        r['groups'] = [gq_index]
        #logger.debug(f'*** in the else loop for add group, r is {r}, and gq_index is {gq_index}')
    return r



def add_leaf_to_g_of_g_id(r, gq, nodes, links, ops):
    # for each list of leaves
    local_leaves = r['leaves']
    gq_data_rec = gq['group']
    gq_data = gq_data_rec['results']
    gq_of_gq_groups_def = gq_data_rec['groups']
    gq_of_gq_rec = gq_of_gq_groups_def[0]['group']
    gq_of_gq_data = gq_of_gq_rec['results']
    #logger.debug(f'#####################gq of gq##########################')
    #logger.debug(f'{gq_of_gq_data}')
    #logger.debug(f'#####################gq data##########################')
    #logger.debug(f'{gq_data}')
    # connect current leaf to leaf in group record, l is the index of the nodes list
    for l in local_leaves:
        local_list = []
        if nodes[l]['G_name'] == gq['l_G_name']:
            # this main leaf is linked to one or more groups inside another group
            if gq['condition'] == 'group':
                # look up the edge going to nodes[l] based on the role in gq, given we know the G_name is correct
                for edge in links:
                    if edge['target'] == l and edge['role'] == gq['l_role']:
                        # find all relations that link to this target
                        local_list = get_all_sources(gq, edge, links, local_list, nodes)
                        # now we have the list of nodes to be added, must find their group id's
                        len_gq = len(gq_data)
                        len_gq_of_gq = len(gq_of_gq_data)
                        # get leaves id from group of groups
                        local_list = get_gq_of_gq_list(gq_of_gq_data, local_list, len_gq)
                        # now sort the list and then group it by the G_index of the value field to get distinc values
                        sorted_list = sorted(local_list, key = itemgetter('vG_id'))
                        #logger.debug('=================sorted list, leaf with g of g =======================')

                        r = add_group_description(r, [{}], 'up', gq['l_role'], ops['label'])
                        r = find_group_ids(sorted_list, r, gq_data)
                        return r


            else:
                #logger.debug(f'bad routing, not a group, something else, condition -> {gq["condition"]}')
                return r

def find_group_ids(sorted_list, r, gq_data):
    # now find the group tht contain the grouped gq_of_gq_keys
    for key, sub_list in groupby(sorted_list, key = itemgetter('vG_id')):
        v_list = [x['gq_data_key'] for x in sub_list]
        for gq_index, gq_d in enumerate(gq_data):
            # gq_index is the index to the nested groups list
            if 'groups' in gq_d:
                # we need to find the index number that corresponds to each v_list
                groups_gq = gq_d['groups']
                correct =  all(elem in groups_gq for elem in v_list)
                if correct:
                    # collect the index number
                    r = add_group_id(r, gq_index)
                    if 'group_description' in gq_d:
                        r['group_description'].append(gq_d['group_description'])
                    else:
                        logger.error('@@@@ Bad group of groups description')

                    break

    return r

def get_gq_of_gq_list(gq_of_gq_data, local_list, len_gq):
    #logger.debug(f'****************get_gq_of_gq_list*********************')
    #logger.debug(f'start get gq of gq list {local_list}')
    for local_l in local_list:
        flag = False
        # find the corresponding records in gq_of_gq_data, and add the len of gq_data
        for key, gq_of_gq in enumerate(gq_of_gq_data):
            gq_leaves = gq_of_gq['leaves']
            for gq_l in gq_leaves:
                if gq_l == local_l['group_id']:
                    local_l['gq_data_key'] = key + len_gq
                    flag = True
                    break

            if flag == True:
                break

    #logger.debug(f'end get_gq_of_gq_list {local_list}')
    return local_list

def get_all_sources(gq, edge, links, local_list, nodes):
    #logger.debug(f'start get all sources {local_list}')
    # first get all g nodes indexes, then find indexes of v nodes
    l_index = edge['target']
    for link in links:
        layer = {}
        if link['target'] == l_index and link['role'] == gq['l_role']:
            layer['leaf_id'] = l_index
            layer['group_id'] = link['source']
            # now find all v nodes, index of v
            layer = get_local_value(gq, edge, links, layer, nodes)
            local_list.append(layer)

    #logger.debug(f'end get all sources {local_list}')
    return local_list

def get_local_value(gq, edge, links, layer, nodes):
    # find all v nodes connected to g node
    source = layer['group_id']
    for link in links:
        v_target = link['target']
        if link['source'] == source and link['role'] == gq['g_role'] and nodes[v_target]['G_name'] == gq['v_G_name']:
            layer['value_id'] = v_target
            layer['vG_id'] = link['G_target']

    return layer

def add_leaf_to_group_id(r, gq, nodes, links, ops):
    # for each list of leaves
    local_leaves = r['leaves']
    gq_data_rec = gq['group']
    gq_data = gq_data_rec['results']
    #logger.debug(f'---- adding leaf to a group id, leaf is {r}')

    # connect current leaf to leaf in group record, l is the index of the nodes list
    for l in local_leaves:
        description = []
        if nodes[l]['G_name'] == gq['l_G_name']:
            # act on the group query details, depending on type -> 'leaf'
            # leaf means look in group's leaves
            if gq['condition'] == 'leaf':
                # look up the edge linking nodes[l] with the role in gq
                for edge in links:
                    if nodes[l]['type'] == "relation":
                        # then edge has leaf as source and a leaf in the group as target
                        if edge['source'] == l and edge['role'] == gq['l_role']:
                            key_index = edge['target']
                            #logger.debug(f'type is leaf/relation, with key index of {key_index}')
                            # now find this nodes list index in the leaves of the group records
                            for gq_index, gq_item in enumerate(gq_data):
                                gq_leaves = gq_item['leaves']
                                for gq_l in gq_leaves:
                                    if gq_l == key_index:
                                        # add the group index to the results record
                                        #logger.debug(f'gq_index is {gq_index}, gq_leaves {gq_leaves}')
                                        r = add_group_id(r, gq_index)
                                        r = add_group_description(r, gq_item['leaf_description'], 'down', gq['l_role'], ops['label'])
                                        #logger.debug(f'a new group should be added {r}')
                                        return r

                    else:
                        # then edge has leaf as target and a leaf in the group as source
                        if edge['target'] == l and edge['role'] == gq['l_role']:
                            key_index = edge['source']
                            #logger.debug(f'type is leaf/att/ent, with key index of {key_index}')
                            # now find this nodes list index in the leaves of the group records
                            for gq_index, gq_item in enumerate(gq_data):
                                gq_leaves = gq_item['leaves']
                                for gq_l in gq_leaves:
                                    if gq_l == key_index:
                                        # add the group index to the results record
                                        r = add_group_id(r, gq_index)
                                        r = add_group_description(r, gq_item['leaf_description'], 'up', edge['role'], ops['label'])
                                        #logger.debug(f'a new group should be added {r}')
                                        return r

            # main leaf is linked to one or more groups inside another group
            else:
                #logger.debug(f'bad routing, not a leaf, something else, condition -> {gq["condition"]}')
                return r

def add_group_description(r, description_list, direction, role, title):
    # test if groups list is there or not
    local_list = copy.deepcopy(description_list)
    local_list[0]['direction'] = direction
    local_list[0]['role'] = role
    # local_list[0]['title'] = title
    if 'group_description' in r:
        # add the id to the existing list
        r['group_description'].append(local_list)
        #logger.debug(f'*** in the if loop for add group description, r is {r}, and leaf_description_list is {local_list}')
    else:
        # else define the list
        r['group_description'] = [local_list]
        #logger.debug(f'*** in the else loop for add group description, r is {r}, and leaf_description_list is {local_list}')
    return r


def add_secondary_leaf(id, leaf, nodes, links):
    node = nodes[id]
    ##logger.debug(f'Loop number {x}')

    if leaf['role'] == 'has':
        # get secondary GID
        #logger.debug(f'Im in a has loop, secondary leaf, with main id {node}')
        #logger.debug(f' the leaf G_name is {leaf["G_name"]}')
        has_links = node['has']
        for G_id in has_links:
            ##logger.debug((f'the G_id is {G_id}'))
            for n in nodes:
                ##logger.debug(f'nodes are {n}')
                if n['G_id'] == G_id and n['G_name'] == leaf['G_name'] and n['dtype'] == 'actual':
                    ##logger.debug((f'actual id2 is {n["id"]}'))
                    id2 = n['id']

    else:
        # get secondary GID
        #logger.debug(f'Im in a relation loop, secondary leaf, with main id {node}')
        role_links = node['edges']
        edges = role_links[leaf['role']]
        for G_id in edges:
            for n in nodes:
                if n['G_id'] == G_id and n['G_name'] == leaf['G_name'] and n['dtype'] == 'actual':
                    id2 = n['id']
    # check to see if actual attribute
    node2 = nodes[id2]
    if node2['type']  == 'attribute' and node2['dtype'] == 'actual':
        # add shadow copy
        shadow = copy.deepcopy(node2)
        shadow['dtype'] = 'shadow'
        global counter
        counter = counter + 1
        shadow['G_id'] = node2['G_id'] + '-' + str(counter)
        shadow['id'] = len(nodes)
        id3 = len(nodes)
        nodes.append(shadow)


        # break original link between id and attribute, and reroute to shadow copy
        #logger.debug((f'links length before = {len(links)}'))
        for link in links:
            if link['source'] == id and link['target'] == id2:
                link['target'] = id3
                newlink = copy.deepcopy(link)
                link['is_act_Attr'] = False
                newlink['source'] = id3
                newlink['target'] = id2

        links.append(newlink)
        #logger.debug((f'links length afterwards = {len(links)}'))
        return id3, nodes, links


    else:
        # return the id only
        return id2, nodes, links

def group_Grakn(colaGraph, group_def_list, logger: Logger):
    colaGraph['grouped'] = colaGraph['basic']
    raw = copy.deepcopy(colaGraph['basic'])
    group_dataset = colaGraph['grouped']
    group_dataset['groups'] = []
    colaGraph['grouped'] = group_dataset
    #logger.debug('===================== total group definition list start ==========================')
    #logger.debug(group_def_list)
    #logger.debug('===================== total group definition list end ==========================')
    with open(f"{basename(__file__)}.output.groups_def.json", "w") as outfile:
        json.dump(group_def_list, outfile)


    # Setup the variable name connections for the datasets
    for group_def in group_def_list:
        group_name = group_def['ops']['name']
        #logger.debug('===================== per group definition  start ==========================')
        #logger.debug(group_def)
        #logger.debug('===================== total group definition end ==========================')
        # Note I am using GLOBALS to match the functionality of main(), may need to refactor
        if group_def['groups'] != []:
            nested_groups = group_def['groups']
            for nested_def in nested_groups:
                nested_group_name = nested_def['group']
                # first get rid of any old nested records
                if isinstance(nested_group_name, dict):
                    # first flatten
                    nested_group_name = nested_group_name['ops']['name']

                #logger.debug('===================== per nested group definition  ==========================')
                #logger.debug(nested_def)
                #logger.debug('=====================  nested group definition list ==========================')
                #logger.debug(f'nested group name is {nested_group_name}')
                if isinstance(nested_group_name, str):
                    # find it in the group_def_list, and reference it in
                    for gd in group_def_list:
                        if gd['ops']['name'] == nested_group_name:
                            nested_def['group'] = gd
                            #logger.debug(f'nested group name is now {gd}')




        # process the group definitions and return results
        colaGraph, group_def  = get_V_group(colaGraph, group_def)

    # reset the raw basic results
    colaGraph['basic'] = raw

    # logout the results and then return them
    #logger.debug(' the group definition list is -> ', group_def_list)
    with open(f"{basename(__file__)}.output.groups_output.json", "w") as outfile:
        json.dump(colaGraph, outfile)

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
    colaGraph = get_data(dbhost, dbport, dbdatabase, dbquery, logger)
    colaGraph['grouped'] = colaGraph['basic']
    raw = copy.deepcopy(colaGraph['basic'])
    group_dataset = colaGraph['grouped']
    group_dataset['groups'] = []
    colaGraph['grouped'] = group_dataset

    group_def_list = [
        {
            "leaves": [
                {
                    "G_name": "event"
                },
                {
                    "G_name": "eventName",
                    "role": "has"
                }
            ],
            "groups": [],
            "results": [],
            "ops": {
                "name": "Event_Record",
                "colour_list": "Yellows",
                "level": 0,
                "label": "Event Record",
                "type": "Type1"
            },
            "constraints": {}
        },
        {
            "leaves": [
                {
                    "G_name": "trace"
                },
                {
                    "G_name": "index",
                    "role": "has"
                },
                {
                    "G_name": "traceId",
                    "role": "has"
                }
            ],
            "groups": [
                {
                    "group": "Event_Record",
                    "condition": "leaf",
                    "l_G_name": "trace",
                    "l_role": "item"
                }
            ],
            "results": [],
            "ops": {
                "name": "Trace_Record",
                "colour_list": "Reds",
                "level": 0,
                "label": "Trace Record",
                "type": "Type2"
            },
            "constraints": {}
        },
        {
            "leaves": [],
            "groups": [
                {
                    "group": "Trace_Record",
                    "condition": "value",
                    "g_G_name": "trace",
                    "basis": "distinct",
                    "v_G_name": "traceId",
                    "g_role": "has"
                }
            ],
            "results": [],
            "ops": {
                "name": "Trace_Session",
                "colour_list": "Blues",
                "level": 0,
                "label": "Trace Session",
                "type": "Type3"
            },
            "constraints": {}
        }
    ]

    colaGraph = group_Grakn(colaGraph, group_def_list, logger)

    # #logger.debug('load the test definition json')
    # with open('./test_definition.json') as json_file:
    #     group_def_list = json.load(json_file)
    #     colaGraph = group_Grakn(colaGraph, group_def_list, logger)

    #logger.debug('--------------------------------------------------------------------')
    #logger.debug('|||||||||||||||||||||| Group Description 1 |||||||||||||||||||||||||||||')
    #logger.debug('--------------------------------------------------------------------')




    colaGraph['basic'] = raw


    with open(outputfile, "w") as outfile:
        json.dump(colaGraph, outfile)

    # with open("groups_only.json", "w") as outfile:
    #     json.dump(colaGraph['grouped']['groups'], outfile)




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
    # logger.info(f"myUniqueSet:, {myUniqueSet}")
    G_types['schema'] = myUniqueSet

    # logger.info('==========================================================================================')
    # logger.info('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    # logger.info(f'g-types is -> {G_types}')
    # logger.info('==========================================================================================')
    # logger.info('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    # logger.info(f'nodes is ->  {nodes}')
    # logger.info('==========================================================================================')
    # logger.info('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    # logger.info(f'edges is -> {edges}')
    # logger.info('==========================================================================================')
    # logger.info('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')


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
def getArgs():

  parser = argparse.ArgumentParser(description="Script params",
                                formatter_class=argparse.ArgumentDefaultsHelpFormatter)
  parser.add_argument("dbhost", nargs='?', default="localhost", help="server host (default: %(default)s)")
  parser.add_argument("dbport", nargs='?', default="1729", help="server port (default: %(default)s)")
  parser.add_argument("dbdatabase", nargs='?', default="typerefinery", help="server database (default: %(default)s)")
  parser.add_argument("dbquery", nargs='?', default=gquery, help="query to use (default: %(default)s)")
  parser.add_argument("outputfile", nargs='?', default=f"{basename(__file__)}.output", help="output file (default: %(default)s)")
  return parser.parse_args()

if __name__ == '__main__':
  args = getArgs()
  # setup logger for init
  log = Logger
  log.remove()
  log.add(f'{basename(__file__)}.log', level="INFO")
  log.info(args)
  main(args.dbhost, args.dbport, args.dbdatabase, args.dbquery, args.outputfile, log)
