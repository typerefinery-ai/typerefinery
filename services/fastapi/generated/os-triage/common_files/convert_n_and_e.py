
from stixorm.module.authorise import authorised_mappings, import_type_factory
from stixorm.module.typedb_lib.factories.auth_factory import get_auth_factory_instance
import copy
from posixpath import basename
import json
import os

import logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

import_type = import_type_factory.get_all_imports()





######################################################################################
#
# Setup Nodes and Edges Array Stuff for Force Graph Display - including icons
#
########################################################################################


def convert_relns(obj):
    nodes = []
    edges = []
    nodes, relation_edges, relation_replacement_edges = setup_relationship(obj)
    edges2 = find_embedded(obj, edges, obj["id"], exclusion_list=["id", "source_ref", "target_ref"])
    edges = edges + edges2
    return nodes, edges, relation_edges, relation_replacement_edges


def convert_sighting(obj):
    nodes = []
    edges = []
    nodes, edges = setup_sighting(obj, nodes, edges)
    # #edges2 = find_embedded(obj, edges, obj["id"], exclusion_list=["id", "observed_data_refs", "where_sighted_refs", "sighting_of_ref"])
    # edges = edges + edges2
    return nodes, edges


def convert_node(obj):
    nodes = []
    edges = []
    nodes, edges = setup_nodes(obj, nodes, edges)
    edges = find_embedded(obj, edges, obj["id"], exclusion_list=["id", "observed_data_refs", "where_sighted_refs", "sighting_of_ref"])
    # edges = edges + edges2
    return nodes, edges


def refine_edges(nodes, original_edges):
    node_ids = [x["id"] for x in nodes]
    edges = [x for x in original_edges if (x["source"] in node_ids and x["target"] in node_ids)]
    return edges


def generate_legend(nodes):
    check_icons = []
    legend = []
    for node in nodes:
        if node["icon"] not in check_icons:
            check_icons.append(node["icon"])
            layer = {}
            layer["icon"] = node["icon"]
            layer["name"] = node["name"]
            legend.append(layer)
    return legend


# def make_nodes_and_edges(obj_list):
#     nodes_edges = {}
#     nodes = []
#     edges = []
#     for obj in obj_list:
#         if obj["type"] == "relationship":
#             edges = setup_relationship(obj, edges)
#         elif obj["type"] == "sighting":
#             nodes, edges = setup_sighting(obj, nodes, edges)
#         else:
#             nodes, edges = setup_nodes(obj, nodes, edges)
#     legend = []
#     node_ids = []
#     for node in nodes:
#         node_ids.append(node["id"])
#         if node["icon"] not in check_icons:
#             check_icons.append(node["icon"])
#             layer = {}
#             layer["icon"] = node["icon"]
#             layer["name"] = node["name"]
#             legend.append(layer)
#     # remove any edges without nodes
#     edges = [x for x in edges if (x["source"] in node_ids and x["target"] in node_ids)]
#     nodes_edges["nodes"] = nodes
#     nodes_edges["edges"] = edges
#     nodes_edges["legend"] = legend
#     return nodes_edges


def setup_relationship(obj):
    source_role = ""
    target_role = ""
    auth_factory = get_auth_factory_instance()
    auth = auth_factory.get_auth_for_import(import_type)
    if "icon" in obj:
        obj_orig = obj['original']
    else:
        obj_orig = obj
    for record in auth["reln"]["standard_relations"]:
        if record['stix'] == obj["relationship_type"]:
            source_role = record['source']
            target_role = record['target']
    source_type = obj_orig['source_ref'].split('--')[0]
    target_type = obj_orig['target_ref'].split('--')[0]
    # setup lists needed for SRO
    nodes = []
    relation_replacement_edges = []
    relation_edges = []
    # setup edges to connect without SRO object
    relation_replacement_edge = {}
    relation_replacement_edge["stix-id"] = obj_orig["id"]
    relation_replacement_edge["type"] = "relationship"
    relation_replacement_edge["name"] = obj_orig["relationship_type"]
    relation_replacement_edge["source"] = obj_orig["source_ref"]
    relation_replacement_edge["target"] = obj_orig["target_ref"]
    relation_replacement_edge["id"] = obj_orig["source_ref"] + '-' + obj_orig["target_ref"]
    relation_replacement_edges.append(relation_replacement_edge)
    # setup source to SRO
    relation_edge = {}
    relation_edge["stix-id"] = obj_orig["id"]
    relation_edge["type"] = "relationship"
    relation_edge["name"] = obj_orig["relationship_type"]
    relation_edge["source"] = obj_orig["source_ref"]
    relation_edge["target"] = obj_orig["id"]
    relation_edge["id"] = obj_orig["source_ref"] + '-' + obj_orig["id"]
    relation_edges.append(relation_edge)
    # setup SRO to target
    relation_edge = {}
    relation_edge["stix-id"] = obj_orig["id"]
    relation_edge["type"] = "relationship"
    relation_edge["name"] = obj_orig["relationship_type"]
    relation_edge["source"] = obj_orig["id"]
    relation_edge["target"] = obj_orig["target_ref"]
    relation_edge["id"] = obj_orig["id"] + '-' + obj_orig["target_ref"]
    relation_edges.append(relation_edge)
    # sort out node
    node = {}
    node["id"] = obj_orig["id"]
    node["original"] = copy.deepcopy(obj_orig)
    node["name"] = obj_orig["relationship_type"].title()
    node['heading'] = obj_orig["relationship_type"].title() + ' - SRO'
    node['description'] = '<br>' + source_role.title() + ' -> ' + source_type.title() + '<br>' + target_role.title() + ' -> ' + target_type.title()
    node["type"] = "relationship"
    node["icon"] = "relationship"
    node["object_form"] = "relationship"
    node["object_group"] = "sro-forms"
    node["object_family"] = "stix-forms"
    nodes.append((node))
    return nodes, relation_edges, relation_replacement_edges


def setup_sighting(obj, nodes, edges):
    # sighting_of_ref
    description = ''
    edge = {}
    edge["stix-id"] = obj["id"]
    edge["type"] = "sighting"
    edge["name"] = "Sighting of " + obj["sighting_of_ref"].split('--')[0]
    description += edge["name"] + '<br>'
    edge["source"] = obj["id"]
    edge["target"] = obj["sighting_of_ref"]
    edge["id"] = obj["id"] + '-' + obj["sighting_of_ref"]
    edges.append(edge)
    # list of observed_data_refs
    for obs in obj["observed_data_refs"]:
        edge = {}
        edge["stix-id"] = obj["id"]
        edge["type"] = "sighting"
        edge["name"] = "Observed Data"
        edge["source"] = obj["id"]
        edge["target"] = obs
        edge["id"] = obj["id"] + '-' + obs
        edges.append(edge)
    # list of where_sighted_refs
    if "where_sighted_refs" in obj:
        for where in obj["where_sighted_refs"]:
            edge = {}
            edge["stix-id"] = obj["id"]
            edge["type"] = "sighting"
            edge["name"] = "Where Sighted -> " + where.split('--')[0]
            description += edge["name"]
            edge["source"] = obj["id"]
            edge["target"] = where
            edge["id"] = obj["id"] + '-' + where
            edges.append(edge)
    # sort out node
    node = {}
    node["id"] = obj["id"]
    node["type"] = "sighting"
    node["original"] = copy.deepcopy(obj)
    sighting_type = "generic"
    if "extensions" in obj:
        for key, value in obj["extensions"].items():
            if key == "extension-definition--0d76d6d9-16ca-43fd-bd41-4f800ba8fc43":
                continue
            else:
                sighting_type = key
                node["icon"] = key
    else:
        node["icon"] = "sighting"

    node["name"] = sighting_type.title()
    node['heading'] = sighting_type.title()
    node['description'] = description
    node["object_form"] = "sighting"
    node["object_group"] = "sro-forms"
    node["object_family"] = "stix-forms"
    nodes.append(node)
    return nodes, edges

def setup_nodes(obj, nodes, edges):
    obj_id = obj["id"]
    node = {}
    node["id"] = obj_id
    node["type"] = obj["type"]
    node["original"] = copy.deepcopy(obj)
    node = find_icon(obj, node)
    nodes.append(node)
    return nodes, edges


def find_embedded(obj, edges, obj_id, exclusion_list=[]):
    auth = authorised_mappings(import_type)
    for key, prop in obj.items():
        if key in exclusion_list:
            continue
        elif key in auth["reln_name"]["embedded_relations"]:
            edges = extract_ids(key, prop, edges, obj_id)
        elif isinstance(prop, list):
            edges = embedded_list(key, prop, edges, obj_id)
        elif isinstance(prop, dict):
            edges = find_embedded(prop, edges, obj_id)
        else:
            continue
    return edges


def embedded_list(key, prop, edges, obj_id):
    logger.debug(f"embedded_list {key} {prop}")
    for pro in prop:
        if isinstance(pro, dict):
            edges = find_embedded(pro, edges, obj_id)
        else:
            continue
    return edges


def extract_ids(key, prop, edges, obj_id):
    auth = authorised_mappings(import_type)
    for ex in auth["reln"]["embedded_relations"]:
        if ex["rel"] == key:
            label = ex["label"]
            source_owner = ex["owner-is-source"]
    edge = {"name": label, "type": "embedded"}
    if isinstance(prop, list):
        for pro in prop:
            if pro.split('--')[0] == "relationship":
                continue
            elif source_owner:
                edge["source"] = obj_id
                edge["target"] = pro
                edge["id"] = obj_id + '-' + pro
                edges.append(copy.deepcopy(edge))
            else:
                edge["source"] = pro
                edge["target"] = obj_id
                edge["id"] = pro + '-' + obj_id
                edges.append(copy.deepcopy(edge))
    else:
        if source_owner:
            edge["source"] = obj_id
            edge["target"] = prop
            edge["id"] = obj_id + '-' + prop
        else:
            edge["source"] = prop
            edge["target"] = obj_id
            edge["id"] = prop + '-' + obj_id
        edges.append(copy.deepcopy(edge))
    return edges


def find_icon(stix_object, node):
    auth = authorised_mappings(import_type)
    logger.debug(f'stix object type {stix_object["type"]}<br>')
    auth_types = copy.deepcopy(auth["types"])
    if stix_object["type"] in auth_types["sdo"]:
        logger.debug(f' going into sdo ---? {stix_object}')
        node = sdo_icon(stix_object, node)
    elif stix_object["type"] in auth_types["sco"]:
        logger.debug(f' going into sco ---> {stix_object}')
        node = sco_icon(stix_object, node)
    elif stix_object["type"] == 'marking-definition':
        node = meta_icon(stix_object, node)
    else:
        logger.error(f'object type not supported: {stix_object.type}, import type {import_type}')
    return node


def sdo_icon(stix_object, node):
    sdo_type = stix_object["type"]
    name = str.title(sdo_type.replace("_", " "))
    heading = name + " - SDO"
    icon_type = ""
    description = ""
    object_form = ""
    object_group = "sdo-forms"
    object_family = ""
    attack_object = False if not stix_object.get("x_mitre_version", False) else True
    if attack_object:
        object_family = "attack-forms"
        attack_type = ""
        sub_technique = False if not stix_object.get("x_mitre_is_subtechnique", False) else True
        if sdo_type[:7] == "x-mitre":
            attack_type = sdo_type[8:]
            name = str.title(attack_type.replace("_", " "))
            heading = "ATT&CK Matrix - " + name
            if sdo_type == "x-mitre-matrix":
                aname = stix_object.get("name", "")
                object_form = "matrix"
                aversion = stix_object.get("x_mitre_version", "")
                heading = "ATT&CK Matrix - " + aname + " - v" + aversion
                description = '<br>' + stix_object.get("description", "")
            elif sdo_type == "x-mitre-tactic":
                aname = stix_object.get("name", "")
                object_form = "tactic"
                T_id = stix_object.get("external_references", [{}])[0].get("external_id", "")
                heading = "ATT&CK Tactic - " + aname + " - " + T_id
                description = '<br>' + stix_object.get("description", "")
            elif sdo_type == "x-mitre-collection":
                aname = stix_object.get("name", "")
                object_form = "collection"
                aversion = stix_object.get("x_mitre_version", "")
                heading = "ATT&CK Collection - " + aname + " - v" + aversion
                description = '<br>' + stix_object.get("description", "")
            elif sdo_type == "x-mitre-data-source":
                aname = stix_object.get("name", "")
                object_form = "data-source"
                T_id = stix_object.get("external_references", [{}])[0].get("external_id", "")
                heading = "ATT&CK Data Source - " + aname + " - " + T_id
                description = '<br>' + stix_object.get("description", "")
            elif sdo_type == "x-mitre-data-component":
                aname = stix_object.get("name", "")
                object_form = "data-component"
                heading = "ATT&CK Data Source - " + aname
                description = '<br>' + stix_object.get("description", "")
            elif sdo_type == "x-mitre-asset":
                description = '<br>' + "ATT&CK Asset"
                object_form = ""
        elif sdo_type == "attack-pattern":
            T_id = stix_object.get("external_references", [{}])[0].get("external_id", "")
            description = '<br>' + stix_object.get("description", "")
            name = "Technique"
            attack_type = "technique"
            heading = name + ' - ' + T_id + " - ATT&CK"
            object_form = "technique"
            if sub_technique:
                attack_type = "subtechnique"
                name = "Sub-Technique"
                heading = name + ' - ' + T_id + " - ATT&CK"
                object_form = "sub-technique"
        elif sdo_type == "course-of-action":
            M_id = stix_object.get("external_references", [{}])[0].get("external_id", "")
            description = '<br>' + stix_object.get("description", "")
            attack_type = "mitigation"
            object_form = "mitigation"
            name = "Mitigation"
            heading = name + ' - ' + M_id + " - ATT&CK"
        elif sdo_type == "intrusion-set":
            G_id = stix_object.get("external_references", [{}])[0].get("external_id", "")
            G_name = stix_object.get("external_references", [{}])[1].get("source_name", "")
            description = '<br>' + stix_object.get("description", "")
            object_form = "attack-group"
            attack_type = "group"
            name = "Group"
            heading = name + ' - ' + G_id + ' - ' + G_name + " - ATT&CK"
        elif sdo_type == "malware" or sdo_type == "tool":
            S_id = stix_object.get("external_references", [{}])[0].get("external_id", "")
            aname = stix_object.get("name", "")
            description = '<br>' + stix_object.get("description", "")
            attack_type = "software"
            if sdo_type == "malware":
                object_form = "software-malware"
            else:
                object_form = "software-tool"
            name = "Software"
            heading = "ATT&CK Software - " + aname + " - " + S_id
        elif sdo_type == "campaign":
            attack_type = "campaign"
            object_form = "attack-campaign"
            aname = stix_object.get("name", "")
            description = '<br>' + stix_object.get("description", "")
            name = "Campaign"
            heading = "ATT&CK Campaign - " + aname
        else:
            attack_type = "unknown"
            name = "Unknown"
            object_form = "default"
            heading = name + " - ATT&CK"

        if "attack-" in attack_type:
            pass
        else:
            attack_type = "attack-" + attack_type
        icon_type = attack_type

    else:
        object_family = "stix-forms"
        if sdo_type == "attack-pattern":
            icon_type = sdo_type
            aname = stix_object.get("name", "")
            object_form = ""
            a_description = stix_object.get("description", "")
            al_list = stix_object.get("aliases", [])
            kill_list = stix_object.get("kill_chain_phases", [])
            kill_list = stix_object.get("kill_chain_phases", [])
            name = "Attack Pattern"
            heading = name + " - " + aname
            if a_description:
                description = "<br>" + a_description
            if al_list:
                description += "<br>Alternative Names -> " + str(al_list)
            if kill_list:
                description += "<br>" + str.title(kill_list[0]['kill_chain_name'].replace("_", " "))
                description += " -> " + kill_list[0]['phase_name'].replace("_", " ")
        elif sdo_type == "campaign":
            icon_type = sdo_type
            aname = stix_object.get("name", "")
            a_description = stix_object.get("description", "")
            al_list = stix_object.get("aliases", [])
            objective  = stix_object.get("objective", "")
            name = "Campaign"
            object_form = "campaign"
            heading = name + " - " + aname
            if a_description:
                description = "<br>" + a_description
            if al_list:
                description += "<br>Alternative Names -> " + str(al_list)
            if objective:
                description += "<br> Objective -> " + objective
        elif sdo_type == "course-of-action":
            icon_type = sdo_type
            aname = stix_object.get("name", "")
            a_description = stix_object.get("description", "")
            name = "Course of Action"
            object_form = "course-of-action"
            heading = name + " - " + aname
            if a_description:
                description = "<br>" + a_description
        elif sdo_type == "grouping":
            icon_type = sdo_type
            aname = stix_object.get("name", "")
            object_form = "grouping"
            a_description = stix_object.get("description", "")
            context  = stix_object.get("context", "")
            name = "Grouping"
            if aname:
                heading = name + " - " + aname
            if a_description:
                description = "<br>" + a_description
            if context:
                description += "<br>OS_Triage -> " + str(context)
        elif sdo_type == "identity":
            object_form = "identity"
            if "extensions" in stix_object:
                icon_type = "identity-contact"
                aname = stix_object.get("name", "")
                S_description = stix_object.get("description", "")
                if S_description:
                    description = "<br>" + S_description
                name = "Individual"
                heading = name + " - " + aname
            else:
                if stix_object.get("identity_class", False):
                    if stix_object["identity_class"] == "individual":
                        icon_type = "identity-individual"
                        aname = stix_object.get("name", "")
                        a_description = stix_object.get("description", "")
                        if a_description:
                            description = '<br>' + a_description
                        name = "Individual"
                        heading = name + " - " + aname
                    elif stix_object["identity_class"] == "organization":
                        icon_type = "identity-organization"
                        aname = stix_object.get("name", "")
                        a_description = stix_object.get("description", "")
                        if a_description:
                            description = '<br>' + a_description
                        name = "Organization"
                        heading = name + " - " + aname
                    elif stix_object["identity_class"] == "class":
                        icon_type = "identity-class"
                        aname = stix_object.get("name", "")
                        a_description = stix_object.get("description", "")
                        if a_description:
                            description = '<br>' + a_description
                        name = "Identity Class"
                        heading = name + " - " + aname
                    elif stix_object["identity_class"] == "system":
                        icon_type = "identity-system"
                        aname = stix_object.get("name", "")
                        a_description = stix_object.get("description", "")
                        if a_description:
                            description = '<br>' + a_description
                        ext_ref = stix_object.get("external_references", [{}])
                        if ext_ref:
                            S_name = ext_ref[0].get("source_name", "")
                            S_description = ext_ref[0].get("description", "")
                            description += '<br>' + S_name + "<br>" + S_description
                        name = "Software System"
                        heading = name
                        if aname:
                            heading = heading + " - " + aname
                    elif stix_object["identity_class"] == "asset":
                        icon_type = "identity-asset"
                        aname = stix_object.get("name", "")
                        a_description = stix_object.get("description", "")
                        if a_description:
                            description = '<br>' + a_description
                        ext_ref = stix_object.get("external_references", [{}])
                        if ext_ref:
                            S_name = ext_ref[0].get("source_name", "")
                            S_description = ext_ref[0].get("description", "")
                            description += '<br>' + S_name + "<br>" + S_description
                        name = "Hardware Asset"
                        heading = name
                        if aname:
                            heading = heading + " - " + aname
                    elif stix_object["identity_class"] == "group":
                        icon_type = "identity-group"
                        aname = stix_object.get("name", "")
                        a_description = stix_object.get("description", "")
                        if a_description:
                            description = '<br>' + a_description
                        name = "Group"
                        heading = name
                        if aname:
                            heading = heading + " - " + aname
                    else:
                        icon_type = "identity-unknown"
                        aname = stix_object.get("name", "")
                        a_description = stix_object.get("description", "")
                        if a_description:
                            description = '<br>' + a_description
                        name = "Unknown"
                        heading = name
                        if aname:
                            heading = heading + " - " + aname
                else:
                    icon_type = "identity-unknown"
                    aname = stix_object.get("name", "")
                    a_description = stix_object.get("description", "")
                    if a_description:
                        description = '<br>' + a_description
                    name = "Unknown"
                    if aname:
                        heading = name + " - " + aname
        elif sdo_type == "incident":
            icon_type = "incident"
            object_form = "incident"
            aname = str.title(stix_object.get("name", ""))
            a_description = stix_object.get("description", "")
            name = "Std Incident"
            heading = name
            if a_description:
                description = '<br>' + a_description
            if aname:
                heading = name + " - " + aname
            if "extensions" in stix_object:
                icon_type = "incident-ext"
                ext = stix_object["extensions"]
                types = ext.get("incident_types", [])
                status = ext.get("investigation_status", "")
                determin = ext.get("determination", "")
                if determin:
                    description = '<br>' + "Determination -> " + determin
                if status:
                    description += ", Status -> " + status
                if types:
                    description += "<br>Incident Types -> "
                    for t in types:
                        description += t + ", "
                name = "Incident Extension"
                heading = name
        elif sdo_type == "indicator":
            icon_type = sdo_type
            aname = stix_object.get("name", "")
            a_description = stix_object.get("description", "")
            pattern  = stix_object.get("pattern", "")
            kill_list = stix_object.get("kill_chain_phases", [])
            pattern_type  = stix_object.get("pattern_type", "")
            types = stix_object.get("indicator_types", [])
            name = "Indicator"
            object_form = "indicator"
            heading = name
            if aname:
                heading += " - " + aname
            if a_description:
                description += "<br>" + a_description
            description += "<br>Pattern Type -> " + pattern_type
            if types:
                description += "Indicator Types -> " + str(types)
            description += "<br>Pattern -> " + pattern
            if kill_list:
                description += "<br>" + str.title(kill_list[0]['kill_chain_name'].replace("_", " "))
        elif sdo_type == "infrastructure":
            icon_type = sdo_type
            aname = stix_object.get("name", "")
            object_form = "infrastructure"
            a_description = stix_object.get("description", "")
            types = stix_object.get("infrastructure_types", "")
            kill_list = stix_object.get("kill_chain_phases", [])
            aliases = stix_object.get("aliases", [])
            name = "Infrastructure"
            heading = name + " - " + aname
            if a_description:
                description = "<br>" + a_description
            if types:
                description += "/Infrastructure Type -> " + types
            if aliases:
                description += ", Aliases -> " + aliases
            if kill_list:
                description += "<br>" + str.title(kill_list[0]['kill_chain_name'].replace("_", " "))
        elif sdo_type == "intrusion-set":
            icon_type = sdo_type
            aname = stix_object.get("name", "")
            object_form = "intrusion-set"
            a_description = stix_object.get("description", "")
            resource_level  = stix_object.get("resource_level", "")
            goals = stix_object.get("goals", [])
            primary_motivation = stix_object.get("primary_motivation", "")
            secondary_motivations = stix_object.get("secondary_motivations", [])
            name = "Intrusion Set"
            heading = name + " - " + aname
            if a_description:
                description = "<br>" + a_description
            if a_description:
                description = "<br>" + a_description
            if resource_level:
                description += "<br>Intruder Resources -> " + resource_level
            if goals:
                description += ", Goals -> " + str(goals)
            if primary_motivation:
                description += "<br>Primary Motivation -> " + primary_motivation
            if secondary_motivations:
                description += "<br>Secondary Motivations ->" + str(secondary_motivations)
        elif sdo_type == "location":
            icon_type = sdo_type
            aname = stix_object.get("name", "")
            object_form = "location"
            a_description = stix_object.get("description", "")
            region = stix_object.get("region", "")
            country = stix_object.get("country", "")
            administrative_area  = stix_object.get("administrative_area ", "")
            city = stix_object.get("city", "")
            street_address = stix_object.get("street_address", "")
            postal_code = stix_object.get("postal_code", "")
            name = "Location"
            heading = name
            if aname:
                heading += " - " + aname
            if a_description:
                description = "<br>" + a_description
            if street_address:
                description += "<br>Street Address -> " + street_address
            if city:
                description += ", City -> " + city
            if postal_code:
                description += ", Postal Code -> " + postal_code
            if administrative_area:
                description += ", Administrative Area -> " + administrative_area
            if country:
                description += ", Country -> " + country
            if region:
                description += ", Region -> " + region
        elif sdo_type == "malware":
            icon_type = "malware"
            aname = stix_object.get("name", "")
            object_form = "malware"
            type_list = stix_object.get("malware_types", [])
            sample_list = stix_object.get("sample_refs", [])
            if type_list:
                description = '<br>' + "Malware Types -> "
                for typ in type_list:
                    description = description + typ + ' '
            if sample_list:
                description = '<br>' + "Sample Refs -> "
                for sam in sample_list:
                    description = description + sam + ', '
            name = "Malware"
            heading = name
            if aname:
                heading += " - " + aname
            if stix_object.get("is_family", False):
                icon_type = "malware-family"
                aname = stix_object.get("name", "")
                name = "Malware Family"
                heading = name + " - " + aname
        elif sdo_type == "malware-analysis":
            icon_type = sdo_type
            object_form = "malware-analysis"
            modules  = stix_object.get("modules ", [])
            analysis_engine_version = stix_object.get("analysis_engine_version", "")
            analysis_definition_version = stix_object.get("analysis_definition_version", "")
            configuration_version = stix_object.get("configuration_version", "")
            result = stix_object.get("result", "")
            result_name = stix_object.get("result_name", "")
            version = stix_object.get("version", "")
            aname = stix_object.get("product", "")
            name = "Malware Analysis"
            heading = name
            if aname:
                heading += " - " + aname
            if version:
                description += "<br>Version -> " + version
            if modules:
                description += ", Modules -> " + str(modules)
            if result:
                description += "<br>Result is -> " + result
            if result_name:
                description += ", Malware Name -> " + result_name
            if version:
                description += "<br>Version -> " + version
            if configuration_version or analysis_engine_version or analysis_definition_version:
                description += "<br>"
                if configuration_version:
                    description += "Config Version -> " + configuration_version
                if analysis_engine_version:
                    description += ", Engine Version -> " + analysis_engine_version
                if analysis_definition_version:
                    description += ", Definition Version -> " + analysis_definition_version
        elif sdo_type == "note":
            icon_type = sdo_type
            object_form = "note"
            abstract = stix_object.get("abstract", "")
            content = stix_object.get("content", "")
            object_refs = stix_object.get("object_refs", [])
            obj_list = ""
            for i, obj in enumerate(object_refs):
                obj_list += str.title(obj.split('--')[0].replace("_", " "))
                if i < len(object_refs) - 1:
                    obj_list = obj_list + ", "
            name = "Note"
            heading = name
            if abstract:
                description = "<br> Abstract -> " + abstract
            if content:
                description += "<br>Content -> " + content
            if object_refs:
                description += "<br>Applies to -> " + str(obj_list)
        elif sdo_type == "observed-data":
            icon_type = sdo_type
            object_form = "observed-data"
            first_observed = stix_object.get("first_observed", None)
            last_observed = stix_object.get("last_observed", None)
            number_observed   = stix_object.get("number_observed ", None)
            object_refs = stix_object.get("object_refs", [])
            obj_list = ""
            for i, obj in enumerate(object_refs):
                obj_list += str.title(obj.split('--')[0].replace("_", " "))
                if i < len(object_refs) - 1:
                    obj_list = obj_list + ", "
            name = "Observed Data"
            heading = name
            if number_observed:
                description = "<br>" + number_observed
            if number_observed and obj_list:
                description += "x "
            if number_observed:
                description += "Observations of - " + obj_list
            if first_observed:
                description += "<br>First Observed -> " + first_observed
            if last_observed:
                description += ", Last Observed -> " + last_observed
        elif sdo_type == "opinion":
            icon_type = sdo_type
            object_form = "opinion"
            opinion = stix_object.get("opinion", "")
            authors  = stix_object.get("authors", [])
            explanation = stix_object.get("explanation", "")
            object_refs = stix_object.get("object_refs", [])
            obj_list = ""
            for i, obj in enumerate(object_refs):
                obj_list += str.title(obj.split('--')[0].replace("_", " "))
                if i < len(object_refs) - 1:
                    obj_list = obj_list + ", "
            name = "Opinion"
            heading = name + " on - " + obj_list
            description = "<br>" + opinion
            if explanation:
                description += "<br>Due to -> " + explanation
            if authors:
                description += "<br>Reported by -> " + str(authors)
        elif sdo_type == "report":
            icon_type = sdo_type
            object_form = "report"
            aname = stix_object.get("name", "")
            a_description = stix_object.get("description", "")
            published = stix_object.get("published", None)
            report_types = stix_object.get("report_types", [])
            object_refs = stix_object.get("object_refs", [])
            obj_list = ""
            for i, obj in enumerate(object_refs):
                obj_list += str.title(obj.split('--')[0].replace("_", " "))
                if i < len(object_refs) - 1:
                    obj_list = obj_list + ", "
            name = "Report"
            heading = name + " - " + aname
            if report_types:
                description += "<br>Report Type -> " + str(report_types)
            if a_description:
                description += "<br>" + a_description
            if published:
                description += "<br>Published on -> " + published
        elif sdo_type == "threat-actor":
            icon_type = sdo_type
            object_form = "threat-actor"
            aname = stix_object.get("name", "")
            a_description = stix_object.get("description", "")
            sophistication = stix_object.get("sophistication", "")
            resource_level = stix_object.get("resource_level", "")
            goals = stix_object.get("goals", [])
            primary_motivation = stix_object.get("primary_motivation", "")
            secondary_motivations = stix_object.get("secondary_motivations", [])
            personal_motivations = stix_object.get("personal_motivations", [])
            name = "Threat Actor"
            heading = name + " - " + aname
            if a_description:
                description = "<br>" + a_description
            if resource_level or goals:
                description += "/Actor Resources -> " + resource_level + ", Goals -> " + str(goals)
            if primary_motivation:
                description += "<br>Primary Motivation -> " + primary_motivation
            if secondary_motivations:
                description += "<br>Secondary Motivations ->" + str(secondary_motivations)
            if personal_motivations:
                description += "<br>Personal Motivations ->" + str(personal_motivations)
        elif sdo_type == "tool":
            icon_type = sdo_type
            aname = stix_object.get("name", "")
            object_form = "tool"
            a_description = stix_object.get("description", "")
            kill_list = stix_object.get("kill_chain_phases", [])
            tool_version = stix_object.get("tool_version", "")
            aliases = stix_object.get("aliases", [])
            tool_types = stix_object.get("tool_types", [])
            name = "Tool"
            heading = name + " - " + aname + " - " + tool_version
            if a_description:
                description += "<br>" + a_description
            if tool_types:
                description += "/Tool Types -> " + tool_types
            if aliases:
                description += "<br>Aliases -> " + aliases
            if kill_list:
                description += "<br>" + str.title(kill_list[0]['kill_chain_name'].replace("_", " "))
        elif sdo_type == "vulnerability":
            icon_type = sdo_type
            aname = stix_object.get("name", "")
            object_form = "vulnerability"
            a_description = stix_object.get("description", "")
            external_references = stix_object.get("external_references", [])
            name = "Vulnerability"
            heading = name
            if aname:
                heading += " -> " + aname
            if a_description:
                description = "<br>" + a_description
            if external_references:
                description += "<br>" + str.title(external_references[0]['kill_chain_name'].replace("_", " "))
        elif sdo_type == "event":
            icon_type = sdo_type
            object_form = "event"
            object_family = "extension-forms"
            aname = stix_object.get("name", "")
            a_description = stix_object.get("description", "")
            goal = stix_object.get("goal", "")
            status = stix_object.get("status", "")
            name = "Event"
            heading = name
            if aname:
                heading += " -> " + aname
            heading += ", Status -> " + status
            if a_description:
                description += "<br>" + a_description
            if goal:
                description += "<br>Goal -> " + goal
        elif sdo_type == "impact":
            object_form = "impact"
            object_family = "extension-forms"
            if "extensions" in stix_object:
                for key, value in stix_object["extensions"].items():
                    if key == "extension-definition--7cc33dd6-f6a1-489b-98ea-522d351d71b9":
                        continue
                    else:
                        icon_type = "impact-" + key
                        if key == "monetary":
                            adescription = stix_object.get("description", "")
                            variety = value.get("variety", "")
                            currency_actual = value.get("currency_actual", "")
                            max_amount = value.get("max_amount", 0)
                            min_amount = value.get("min_amount", 0)
                            if adescription:
                                description = '<br>' + adescription
                            if variety:
                                description += "<br>" + "Variety -> " + variety + "<br>" + "Currency -> "
                            if currency_actual:
                                description += currency_actual
                            if max_amount:
                                description += "<br>" + "Max Amount -> $" + str(max_amount)
                            if min_amount:
                                description += "<br>" + "Min Amount -> $" + str(min_amount)
                            name = "Monetary Impact"
                            heading = name
                        elif key == "availability":
                            adescription = stix_object.get("description", "")
                            impacted_entity_counts = stix_object.get("impacted_entity_counts", [])
                            avail = value.get("availability_impact", 0)
                            description = '<br>' + adescription + "<br>" + "Total Impact ->" + str(avail) + "<br>Impacted Entities -> "
                            if adescription:
                                description += '<br>' + adescription
                            if avail:
                                description += "<br>" + "Variety -> " + str(avail)
                            for k, v in impacted_entity_counts.items():
                                description += k + " -> " + str(v)
                                if len(impacted_entity_counts.items()) > 1:
                                    description = description + ", "
                            name = "Availability Impact"
                            heading = name
                        elif key == "integrity":
                            adescription = stix_object.get("description", "")
                            impacted_entity_counts = stix_object.get("impacted_entity_counts", [])
                            info = value.get("information_type", "")
                            altrd = value.get("alteration", "")
                            r_c = value.get("record_count", 0)
                            r_s = value.get("record_size", 0)
                            if adescription:
                                description = '<br>' + adescription
                            if variety:
                                description += "<br>" + "Variety -> " + variety + "<br>" + "Currency -> "
                            if currency_actual:
                                description += currency_actual
                            if max_amount:
                                description += "<br>" + "Max Amount -> $" + str(max_amount)
                            if min_amount:
                                description += "<br>" + "Min Amount -> $" + str(min_amount)
                            description = '<br>' + adescription + "<br>" + "Info Type -> " + info + "Alteration Type -> "
                            description += altrd + "<br>" + "Number of Records -> " + str(r_c)
                            description +=  "  Size of Records -> " + str(r_s)
                            description += "<br>Impacted Entities -> "
                            for k, v in impacted_entity_counts.items():
                                description += k + " -> " + str(v)
                                if len(impacted_entity_counts.items()) > 1:
                                    description = description + ", "
                            name = "Integrity Impact"
                            heading = name
                        elif key == "confidentiality":
                            adescription = stix_object.get("description", "")
                            impacted_entity_counts = stix_object.get("impacted_entity_counts", [])
                            info = value.get("information_type", "")
                            loss_type = value.get("loss_type", "")
                            r_c = value.get("record_count", 0)
                            r_s = value.get("record_size", 0)
                            description = '<br>' + adescription + "<br>" + "Info Type -> " + info + "Loss Type -> "
                            description += loss_type + "<br>" + "Number of Records -> " + str(r_c)
                            description +=  "  Size of Records -> " + str(r_s)
                            description += "<br>Impacted Entities -> "
                            for k, v in impacted_entity_counts.items():
                                description += k + " -> " + str(v)
                                if len(impacted_entity_counts.items()) > 1:
                                    description = description + ", "
                            name = "Integrity Impact"
                            heading = name
                        elif key == "physical":
                            adescription = stix_object.get("description", "")
                            impacted_entity_counts = stix_object.get("impacted_entity_counts", [])
                            impact_type = value.get("impact_type", "")
                            asset_type = value.get("asset_type", "")
                            description = '<br>' + adescription + "<br> Asset Type -> " +  asset_type
                            description += ", Physical Impact -> " + impact_type
                            description += "<br>Impacted Entities -> "
                            for k, v in impacted_entity_counts.items():
                                description += k + " -> " + str(v)
                                if len(impacted_entity_counts.items()) > 1:
                                    description = description + ", "
                            name = "Physical Impact"
                            heading = name
                        elif key == "external":
                            adescription = stix_object.get("description", "")
                            impacted_entity_counts = stix_object.get("impacted_entity_counts", [])
                            loss = value.get("impact_type", "")
                            description = '<br>' + adescription + "<br>" + "Actual Loss -> " + loss
                            description += "<br>Impacted Entities -> "
                            for k, v in impacted_entity_counts.items():
                                description += k + " -> " + str(v)
                                if len(impacted_entity_counts.items()) > 1:
                                    description = description + ", "
                            name = "External Impact"
                            heading = name
                        elif key == "traceability":
                            adescription = stix_object.get("description", "")
                            impacted_entity_counts = stix_object.get("impacted_entity_counts", [])
                            tracking = value.get("traceability_impact", "")
                            description = '<br>' + adescription + "<br>" + "Ability to Trace -> " + tracking
                            description += "<br>Impacted Entities -> "
                            for k, v in impacted_entity_counts.items():
                                description += k + " -> " + str(v)
                                if len(impacted_entity_counts.items()) > 1:
                                    description = description + ", "
                            name = "Traceability Impact"
                            heading = name
            else:
                icon_type = "impact"
                name = icon_type
                heading = name
                description = heading
                object_form = "impact"
                object_family = "extension-forms"
        elif sdo_type == "sequence":
            object_form = "sequence"
            object_family = "extension-forms"
            if stix_object["step_type"] == "start_step" or stix_object["step_type"] == "end_step":
                icon_type = "step-terminal"
                seq_type = stix_object.get("sequence_type", "")
                name = str.title(stix_object["step_type"].replace("_", " "))
                heading = name + ' for ' + str.title(seq_type)
            elif stix_object["step_type"] == "single_step":
                if "on_completion" in stix_object:
                    icon_type = "step-single"
                    seq_type = stix_object.get("sequence_type", "")
                    name = str.title(stix_object["step_type"].replace("_", " "))
                    heading = name + ' for ' + str.title(seq_type)
                elif "on_success" in stix_object:
                    icon_type = "step-xor"
                    seq_type = stix_object.get("sequence_type", "")
                    name = str.title(stix_object["step_type"].replace("_", " "))
                    heading = name + ' for ' + str.title(seq_type)
                else:
                    icon_type = "step-single"
                    seq_type = stix_object.get("sequence_type", "")
                    name = str.title(stix_object["step_type"].replace("_", " "))
                    heading = name + ' for ' + str.title(seq_type)
            else:
                icon_type = "step-parallel"
                seq_type = stix_object.get("sequence_type", "")
                name = str.title(stix_object["step_type"].replace("_", " "))
                heading = name + ' for ' + str.title(seq_type)
        elif sdo_type == "task":
            icon_type = sdo_type
            object_form = "task"
            object_family = "extension-forms"
            aname = stix_object.get("name", "")
            outcome = stix_object.get("outcome", "")
            impacted_entity_counts = stix_object.get("impacted_entity_counts", [])
            a_description = stix_object.get("description", "")
            priority = stix_object.get("priority", None)
            task_types = stix_object.get("task_types", [])
            name = "Task"
            heading = name
            if aname:
                heading += " -> " + aname
            if outcome:
                description += "<br>Outcome -> " + outcome
            if priority:
                description += ", Priority -> " + priority
            if task_types:
                description += "<br>Task Types -> " + task_types
            if a_description:
                description += "<br>" + a_description
            if impacted_entity_counts:
                description += "<br>Impacted Entities -> "
                for k, v in impacted_entity_counts.items():
                    description += k + " -> " + str(v)
                    if len(impacted_entity_counts.items()) > 1:
                        description = description + ", "
        else:
            icon_type = sdo_type
            name = icon_type
            heading = name
            description = heading
    node["icon"] = icon_type
    node["name"] = name
    node["heading"] = heading
    node["description"] = description
    node["object_form"] = object_form
    node["object_group"] = object_group
    node["object_family"] = object_family
    return node


def sco_icon(stix_object, node):
    sco_type = stix_object["type"]
    name = ""
    heading = ""
    icon_type = ""
    description = ""
    object_form = ""
    object_group = "sco-forms"
    object_family = "stix-forms"
    if sco_type == "anecdote":
        icon_type = sco_type
        value = stix_object.get("value", "")
        report_date = stix_object.get("report_date", None)
        name = "Anecdote"
        heading = name
        object_form = "anecdote"
        object_family = "extension-forms"
        if report_date:
            heading += " -> " + str(report_date)
        description += "/Statement -> " + value
    elif sco_type == "artifact":
        icon_type = sco_type
        mime_type = stix_object.get("mime_type", "")
        url = stix_object.get("url", "")
        hashes = stix_object.get("hashes", {})
        encryption_algorithm = stix_object.get("encryption_algorithm", "")
        decryption_key = stix_object.get("priority", None)
        name = "Artifact"
        object_form = "artifact"
        heading = name
        if mime_type:
            heading += " -> " + mime_type
        if encryption_algorithm:
            description += "<br>Encryption Algorithm -> " + encryption_algorithm
        if decryption_key:
            description += ", Decryption Key -> " + decryption_key
        if url:
            description += ", URL -> " + url
        if hashes:
            description += "<br>Hashes -> "
            for k, v in hashes.items():
                description += "<br>  - " + k + " -> " + str(v)
    elif sco_type == "autonomous-system":
        icon_type = sco_type
        object_form = "autonomous-system"
        aname = stix_object.get("name", "")
        number = stix_object.get("number", None)
        rir = stix_object.get("rir", "")
        name = "Autonomous System"
        heading = name
        if aname:
            heading += " -> " + aname
        description += "<br>Number -> " + number
        if rir:
            description += "<br>Regional Internet Registry (RIR) -> " + rir
    elif sco_type == "directory":
        object_form = "directory"
        icon_type = sco_type
        path = stix_object.get("path", "")
        path_enc = stix_object.get("path_enc", "")
        ctime = stix_object.get("ctime", None)
        mtime = stix_object.get("mtime", None)
        atime = stix_object.get("atime", None)
        name = "Directory"
        heading = name
        if path_enc:
            heading += " -> " + path_enc
        description += "<br>Path -> " + path
        if ctime:
            description += "<br>Created -> " + ctime
        if mtime:
            description += "<br>Modified -> " + mtime
        if atime:
            description += "<br>Accessed" + atime
    elif sco_type == "domain-name":
        icon_type = "domain"
        object_form = "domain-name"
        value = stix_object.get("value", "")
        resolves_to_refs = stix_object.get("resolves_to_refs", [])
        name = "Domain Name"
        heading = name
        if value:
            heading += " -> " + value
    elif sco_type == "email-addr":
        icon_type = sco_type
        object_form = "email-addr"
        value = stix_object.get("value", "")
        display_name = stix_object.get("display_name", "")
        name = "Email Address"
        heading = name
        if display_name:
            heading += " -> " + display_name
        description += "<br>Value -> " + value
    elif sco_type == "email-message":
        icon_type = "email-message"
        object_form = icon_type
        content_type = stix_object.get("content_type", "")
        received_lines = stix_object.get("received_lines", [])
        body = stix_object.get("body", "")
        subject = stix_object.get("subject", "")
        message_id = stix_object.get("message_id", "")
        date = stix_object.get("date", None)
        additional_header_fields = stix_object.get("additional_header_fields", {})
        is_multipart = stix_object.get("is_multipart", False)
        name = "Email Message"
        heading = name
        if content_type:
            heading += " -> " + content_type
        if subject:
            description += "<br>Subject -> " + subject
        if date:
            description += ", Date -> " + date
        if body:
            description += "<br>Body -> " + body
        if message_id:
            description += "<br>Message ID -> " + message_id
        if received_lines:
            description += "<br>Received Header -> "
            for v in received_lines:
                description += "<br> - " + str(v)
        if is_multipart:
            icon_type = "email-message-mime"
            body_multipart = stix_object.get("body_multipart", [])
            name = "MIME " + name
            heading = name
            if content_type:
                heading += " -> " + content_type
            if body_multipart:
                description += "<br>MIME Parts -> "
                for v in body_multipart:
                    description += "<br> - " + str(v)
    elif sco_type == "file":
        icon_type = "file"
        object_form = "file"
        aname = stix_object.get("name", "")
        hashes = stix_object.get("hashes", {})
        name_enc = stix_object.get("name_enc", "")
        ctime = stix_object.get("ctime", None)
        mtime = stix_object.get("mtime", None)
        atime = stix_object.get("atime", None)
        mime_type = stix_object.get("mime_type", "")
        name = "File"
        heading = name
        if aname:
            heading += " -> " + aname
        if name_enc:
            description += "<br>Priority -> " + name_enc
        if mime_type:
            description += "MIME Type -> " + mime_type
        if ctime:
            description += "<br>Created -> " + ctime
        if mtime:
            description += "<br>Modified -> " + mtime
        if atime:
            description += "<br>Accessed" + atime
        if hashes:
            description += "<br>Hashes -> "
            for k, v in hashes.items():
                description += "<br>  - " + k + " -> " + str(v)
        if "extensions" in stix_object:
            if stix_object["extensions"].get("archive-ext", False):
                icon_type = "file-archive"
                archive = stix_object.get("archive-ext", {})
                comment = archive.get("comment", "")
                name = "Archive " + name
                heading = name
                if aname:
                    heading += " -> " + aname
                if comment:
                    description += "<br>Comment -> " + comment
            elif stix_object["extensions"].get("pdf-ext", False):
                icon_type = "file-pdf"
                pdf = stix_object.get("pdf-ext", {})
                doc_info_dict = pdf.get("document_info_dict", {})
                name = "PDF " + name
                heading = name
                if aname:
                    heading += " -> " + aname
                if doc_info_dict:
                    for k, v in doc_info_dict.items():
                        description += "<br>" + k + " -> " + str(v)
            elif stix_object["extensions"].get("raster-image-ext", False):
                icon_type = "file-img"
                img = stix_object.get("raster-image-ext", {})
                exif_tags = img.get("exif_tags", {})
                name = "Image " + name
                heading = name
                if aname:
                    heading += " -> " + aname
                if exif_tags:
                    for k, v in exif_tags.items():
                        description += "<br>" + k + " -> " + str(v)
            elif stix_object["extensions"].get("windows-pebinary-ext", False):
                icon_type = "file-bin"
                binary = stix_object.get("windows-pebinary-ext", {})
                pe_type = binary.get("pe_type", "")
                number_of_sections = binary.get("number_of_sections", None)
                name = "Binary " + name
                heading = name
                if aname:
                    heading += " -> " + aname
                if pe_type:
                    description += "<br>Executable Type -> " + pe_type
                if number_of_sections:
                    description += ", Number of Sections -> " + number_of_sections
            elif stix_object["extensions"].get("ntfs-ext", False):
                icon_type = "file-ntfs"
                ntfs = stix_object.get("ntfs-ext", "")
                alt_list = ntfs.get("alternate_data_streams", [])
                name = "NTFS " + name
                heading = name
                if aname:
                    heading += " -> " + aname
                if alt_list:
                    description += "<br>Number of Streams -> " + len(alt_list)
    elif sco_type == "ipv4-addr":
        icon_type = sco_type
        object_form = sco_type
        value = stix_object.get("value", "")
        name = "IPv4 Address"
        heading = name
        description += "<br>Value -> " + value
    elif sco_type == "ipv6-addr":
        icon_type = sco_type
        object_form = sco_type
        value = stix_object.get("value", "")
        name = "IPv6 Address"
        heading = name
        description += "<br>Value -> " + value
    elif sco_type == "mac-addr":
        icon_type = sco_type
        object_form = sco_type
        value = stix_object.get("value", "")
        name = "MAC Address"
        heading = name
        description += "<br>Value -> " + value
    elif sco_type == "mutex":
        icon_type = sco_type
        object_form = sco_type
        aname = stix_object.get("name", "")
        name = "Mutex"
        heading = name
        description += "<br>Name -> " + aname
    elif sco_type == "network-traffic":
        icon_type = "network-traffic"
        object_form = sco_type
        protocols = stix_object.get("protocols", [])
        ipfix = stix_object.get("ipfix", {})
        name = "Network Traffic"
        heading = name
        if protocols:
            description += "<br>Protocols -> " + protocols
        if ipfix:
            for k, v in ipfix.items():
                description += "<br> - " + k + " -> " + str(v)
        if "extensions" in stix_object:
            if stix_object["extensions"].get("http-request-ext", False):
                icon_type = "network-traffic-http"
                http = stix_object.get("http-request-ext", "")
                request_method = http.get("request_method", "")
                request_value = http.get("request_value", "")
                request_version = http.get("request_version", "")
                request_header = http.get("request_header", {})
                name = "HTTP " + name
                heading = name
                if request_method:
                    description += "<br>HTTP Method -> " + request_method
                if request_value:
                    description += ", Request Value -> " + request_value
                if request_version:
                    description += "<br>Request Version -> " + request_version
                if request_header:
                    for k, v in request_header.items():
                        description += "<br> - " + k + " -> " + str(v)
            elif stix_object["extensions"].get("icmp-ext", False):
                icon_type = "network-traffic-icmp"
                name = "ICMP " + name
                heading = name
            elif stix_object["extensions"].get("tcp-ext", False):
                icon_type = "network-traffic-tcp"
                name = "TCP " + name
                heading = name
            elif stix_object["extensions"].get("socket-ext", False):
                icon_type = "network-traffic-sock"
                name = "Socket " + name
                heading = name

    elif sco_type == "process":
        icon_type = sco_type
        object_form = sco_type
        pid = stix_object.get("pid", "")
        cwd = stix_object.get("cwd", "")
        command_line = stix_object.get("command_line", "")
        environment_variables = stix_object.get("environment_variables", {})
        name = "Process"
        heading = name
        if pid:
            description += "Process ID -> " + str(pid)
        if command_line:
            description += ", Command Line -> " + command_line
        if cwd:
            description += "<br>CWD -> " + cwd
        if environment_variables:
            description += "<br>IEnvironment Variables -> "
            for k, v in environment_variables.items():
                description += "<br> - " + k + " -> " + str(v)
        if "extensions" in stix_object:
            if stix_object["extensions"].get("windows-process-ext", False):
                windows = stix_object.get("windows-process-ext", "")
                window_title = windows.get("window_title", "")
                integrity_level = windows.get("integrity_level", "")
                startup_info = windows.get("startup_info", {})
                name = "Windows " + name
                heading = name
                if window_title:
                    description += "<br>Windows Title -> " + window_title
                if integrity_level:
                    description += "<br>Task Types -> " + integrity_level
                if startup_info:
                    description += "<br>Startup Info -> "
                    for k, v in startup_info.items():
                        description += "<br>" + k + " -> " + str(v)
            elif stix_object["extensions"].get("windows-service-ext", False):
                service = stix_object.get("windows-service-ext", "")
                display_name = service.get("display_name", "")
                service_name = service.get("service_name", "")
                start_type = service.get("start_type", "")
                service_type = service.get("service_type", "")
                service_status = service.get("service_status", "")
                name = "Windows Service"
                heading = name
                if display_name:
                    description += "<br>Display Name -> " + display_name
                if service_name:
                    description += ", Service Name -> " + service_name
                if service_status:
                    description += "<br>Service Status -> " + service_status
                if service_type:
                    description += ", Service Type -> " + service_type
                if start_type:
                    description += "<br>Service Status -> " + start_type
    elif sco_type == "software":
        icon_type = sco_type
        object_form = sco_type
        aname = stix_object.get("name", "")
        cpe = stix_object.get("cpe", "")
        swid = stix_object.get("swid", "")
        vendor = stix_object.get("vendor", "")
        version = stix_object.get("version", "")
        name = "Software"
        heading = name
        if aname:
            heading += " -> " + aname
        if cpe:
            description += "<br>CPE -> " + cpe
        if swid:
            description += "<br>SWID -> " + swid
        if vendor:
            description += "<br>" + vendor + ' - ' + aname
        if version:
            description += ", Version" + version
    elif sco_type == "url":
        icon_type = sco_type
        object_form = sco_type
        value = stix_object.get("value", "")
        name = "URL"
        heading = name
        description += "<br>Value -> " + value
    elif sco_type == "user-account":
        icon_type = sco_type
        object_form = sco_type
        user_id = stix_object.get("user_id", "")
        credential = stix_object.get("credential", "")
        account_login = stix_object.get("account_login", "")
        account_type = stix_object.get("account_type", "")
        display_name = stix_object.get("display_name", "")
        name = "User Account"
        heading = name
        if display_name:
            description += "<br>Display Name -> " + display_name
        if account_type:
            description += "<br>Account Type -> " + account_type
        if user_id:
            description += ", User ID -> " + user_id
        if account_login:
            description += "<br>Login String ->" + account_login
        if credential:
            description += ", Credential -> " + credential
        if "extensions" in stix_object:
            if stix_object["extensions"].get("unix-account-ext", False):
                icon_type = "user-account-unix"
                name = "Unix " + name
                heading = name
    elif sco_type == "windows-registry-key":
        key = stix_object.get("key", "")
        object_form = sco_type
        values = stix_object.get("values", [])
        name = "Windows Registry Key"
        heading = name
        if key:
            description += "<br>Registry Key -> " + key
        if values:
            description += "<br>Windows Registry Key Values -> "
            for i, v in enumerate(values):
                description += "<br>"
                name = v.get("name", "")
                data = v.get("data", "")
                data_type = v.get("data_type", "")
                if name:
                    description += "Value Name -> " + name
                if data_type:
                    description += ", Data Type -> " + data_type
                if data:
                    description += ", Registry Data -> " + data
    elif sco_type == "x509-certificate":
        object_form = sco_type
        issuer = stix_object.get("issuer", "")
        subject = stix_object.get("subject", "")
        name = "X.509 Certificate"
        heading = name
        if issuer:
            description += "<br>Issuer -> " + issuer
        if subject:
            description += "<br>Subject -> " + subject
    else:
        pass
    node["icon"] = icon_type
    node["name"] = name
    node["heading"] = heading
    node["description"] = description
    node["object_form"] = object_form
    node["object_group"] = object_group
    node["object_family"] = object_family
    return node



def meta_icon(stix_object, node):
    name = "Marking"
    heading = "Marking"
    icon_type = "marking"
    object_form = "marking"
    object_group = "meta-forms"
    object_family = "stix-forms"
    description = ""
    type = stix_object.get("definition_type", "")
    if type == "tlp":
        definition = stix_object.get("definition", {})
        colour = definition.get("tlp", "")
        heading = heading + " -> " + str.title(colour) + '!'
    else:
        definition = stix_object.get("definition", {})
        statement = definition.get("statement", "")
        heading = heading + " -> Statement"
        description = '<br>' + statement
    node["icon"] = icon_type
    node["name"] = name
    node["heading"] = heading
    node["description"] = description
    node["object_form"] = object_form
    node["object_group"] = object_group
    node["object_family"] = object_family
    return node

