import json
from itertools import combinations
from flask import Flask, request
from rdflib import Graph
from src.offline_lib.offline_app import (
    init_rdflib,
    sparql_query,
    init_namespaces,
)


app = Flask(__name__)
offline_graph = Graph()

def get_all_keys(param_dict):
    """
    A function that gets the keys from a dict

        - **parameters**, **return**::
   
    :return all_keys: A list of keys from a dict
    """
    all_keys = set()
    for key, value in param_dict.items():
        for inner_key in value.keys():
            all_keys.add(inner_key)
    return list(all_keys)

def filter_compare(compare, all_keys):
    """
    A function that filters the correct SLA attributes that have to be considered

        - **parameters**, **return**::
   
    :return compare_dict: The compare dict with the correct attributes to be considered
    """
    compare_dict = compare.copy()
    for dct in compare:
        for key in dct.keys():
            if key not in all_keys:
                compare_dict.remove(dct)
                break
    return compare_dict

def find_combinations(compare, features):
    """
    A function that solves the Maximum Coverage Problem.

        - **parameters**, **return**::
    :parameter compare: A list of dictionaries that represent the constraints.
    :parameter features: A dictionary that maps each item to its features.

    
    :return combination: A sorted list of item combinations that maximize the coverage of the given features.
    """

    # Create a dictionary of items that meet the comparison criteria for each attribute
    compare_items = {}
    for threshold in compare:
        attr = list(threshold.keys())[0]
        val = float(list(threshold.values())[0])
        compare_items[attr] = set([item for item in features if attr in features[item] and float(features[item][attr]) <= val])

    # Create a list of all possible combinations of items
    all_items = set(features.keys())
    item_combinations = []
    for length in range(1, len(all_items)+1):
        for combination in combinations(all_items, length):
            if len(combination) <= len(compare):
                item_combinations.append(combination)

    # Find the combinations that meet the comparison criteria for all attributes
    valid_combinations = []
    for combination in item_combinations:
        meets_criteria = True
        for attr in compare_items:
            if len(compare_items[attr].intersection(combination)) != 1:
                meets_criteria = False
                break
        if meets_criteria:
            valid_combinations.append(combination)

    # Sort the combinations by their score (the sum of values of the items)
    valid_combinations_scores = []
    for combination in valid_combinations:
        score = sum([float(features[item][attr]) for item in combination for attr in features[item]])
        valid_combinations_scores.append((combination, score))
    valid_combinations_scores.sort(key=lambda x: x[1])

    # Return the sorted combinations
    return [combination for combination, _ in valid_combinations_scores]

@app.route("/sparql_extended_pet", methods=["POST", "GET"])
def sparql_extended_PET(pet_json):
    """
    Main function to get the right PETs for the given Data the user provides

        - **parameters**, **return**::
    :parameter pet_json: Data collection with the Data given form the user (containing service, situation, vehicleData)

    :return combinations_with_input: A sorted list of item combinations that fullfill the serviceSLA attributes requirements
    :return compare: A List with all serviceSLA attributes that were considered in the combination 
    """

    features_to_compare=[]
    global offline_graph

    #<-------------3.1, get the Service Properties------------------>
    get_sla_query = ("SELECT * WHERE{" +
     "PrivacyContextModel:" +pet_json["service"]+" PrivacyContextModel:hasSLA ?SLA." +
     "?SLA ?p ?o. Filter(?p != rdfs:label).}") 
    result_sla=json.loads(sparql_query(offline_graph, get_sla_query).decode('utf-8'))

    # Get all needed features from the SLA
    # Need to extract the attributes and selected Data and put it into the query
    # All attributes of an SLA (locDataQuality, ....)
    p_values_query =  "VALUES ?p {"
    #All selected Data
    priv_values_query = "VALUES ?o {"
    for priv in result_sla["results"]["bindings"]:
        #only care if its a literal (no rdf:type, ....)
        if priv["o"]["type"] == "literal":
            features_to_compare.append({priv["p"]["value"]:priv["o"]["value"]})
            p_values_query = p_values_query + "<"+priv["p"]["value"]+"> "
    p_values_query = p_values_query + "}."

    #<-------------3.2, get the Priv features from PET------------------>
    for data in pet_json["selectedData"]:
        priv_values_query = priv_values_query + "PrivacyContextModel:"+data+" "
    priv_values_query = priv_values_query + "}."
    
    # Finished query
    pet_query = ("SELECT ?PET ?feature ?p ?attributes ?o WHERE{" +
     p_values_query +
     priv_values_query +
   "?PET PrivacyContextModel:hasInput ?o; PrivacyContextModel:hasFeature ?feature.?feature ?p ?attributes}")
    # If one of them is empty, either the SLA has no attributes or no Data is selected
    if(p_values_query == "VALUES ?p {}." or priv_values_query == "VALUES ?o {}."):
        raise ValueError("Error: Empty values query. Either the Service has no attributes to compare, or you didnt choose any data")
    result_pet=json.loads(sparql_query(offline_graph, pet_query).decode('utf-8'))
    #Dict. only with PrivFeatures and their attributes for calculations
    PET_array = {}
    # Second Dict. to later connect each combination with the corresponding Data Input
    PET_has_input_array = {}
    for attribute in result_pet["results"]["bindings"]:
        if(attribute["PET"]["value"] not in PET_array): 
            PET_array[attribute["PET"]["value"]]={attribute["p"]["value"]:attribute["attributes"]["value"]}
            PET_has_input_array[attribute["PET"]["value"]]={attribute["p"]["value"]:attribute["attributes"]["value"], "hasInput":attribute["o"]["value"]}
        else:
            PET_array[attribute["PET"]["value"]][attribute["p"]["value"]] = attribute["attributes"]["value"]
            PET_has_input_array[attribute["PET"]["value"]][attribute["p"]["value"]] = attribute["attributes"]["value"]
            PET_has_input_array[attribute["PET"]["value"]]["hasInput"] = attribute["o"]["value"]

    feature_keys = get_all_keys(PET_array)
    compare = filter_compare(features_to_compare, feature_keys)
    result = find_combinations(compare, PET_array)
    combinations_with_input = add_input_to_PET(result, PET_has_input_array)
    

    return {"combinations": combinations_with_input, "compare": features_to_compare }


def add_input_to_PET(combinations,PET_has_input_array):
    """
    Funtion that adds the priv feature attribute value and the input Datatype of each PET to a json. 
    """
    combinations_with_input = []
    for array in combinations:
        combination = []
        for pet in array:
            combination.append({pet:PET_has_input_array[pet]})
        combinations_with_input.append(combination)
    return combinations_with_input

@app.route("/sparqlExtendedPET", methods=["POST", "GET"])
def sparqlExtendetPET():
    """
    Funtion that redirects the request
    """
    pet_json = request.get_json()
    return sparql_extended_PET(pet_json)

@app.route("/sparql_entities", methods=["POST", "GET"])
def sparql_entities(entities_json):
    """
    Function to get the right vehicleData that are in the same DataDependency

        - **parameters**, **return**::

    :parameter entities_json: Data collection with the vehicleData given form the user 

    :return result_array: An array with all correct vehicleData in the same DataDependency
    """

    entities_json["data"]
    global offline_graph
    result_array=[]
    data_values = "VALUES ?data {"
    for data in entities_json["data"]:
        data_values = data_values + " PrivacyContextModel:" + data
    data_values = data_values + "}."
    query_string = ("SELECT * WHERE{PrivacyContextModel:" + entities_json["service"] + " PrivacyContextModel:requestsDataFrom ?vehicleComponent. ?component PrivacyContextModel:belongsToVehicleComponent ?vehicleComponent. ?component PrivacyContextModel:produces ?restData. " +
    data_values +
    " ?dataDependency PrivacyContextModel:among ?data." + 
    " ?pet a PrivacyContextModel:PET. ?pet PrivacyContextModel:hasInput ?restData. ?dataDependency PrivacyContextModel:among ?restData.} " 
    )
    result=json.loads(sparql_query(offline_graph, query_string).decode('utf-8'))
    result_array.append({data:result})
    return result_array

@app.route("/sparqlEntities", methods=["POST", "GET"])
def sparqlEntities():
    """
    Funtion that redirects the request
    """
    entities_json = request.get_json()
    return sparql_entities(entities_json)

@app.route("/sparqlAutocomplete", methods=["POST"])
def sparqlAutocomplete():
    """Fetches request from frontend and redirects it to "sparql_autocomplete()"

    Fetches request from frontend and redirects it to "sparql_autocomplete()"
    If the offline graph is not created it, it will now via RDFlib.

    - **parameters**, **return**::

        :return sparql_autocomplete(): Returns the value of sparql_autocomplete
    """
    autocomplete_json = request.get_json()
    return sparql_autocomplete(autocomplete_json)


def sparql_autocomplete(autocomplete_json):
    """Gets request data in json from sparqlQutocomplete() and returns the sparql query result back"

    Gets request data in json from sparqlQutocomplete() and builds a sparql query that is executed on
    the offline graph created by RDFLib.  

    - **parameters**, **return**::

        :return sparql_data: Returns the sparql result, that should have the wanted PET data 
    """

    queue = """SELECT * WHERE{
     ?pet a PrivacyContextModel:PET;
          PrivacyContextModel:provides cv-priv:""" + autocomplete_json[0]["id"] + """;
          PrivacyContextModel:hasInput ?data.
     cv-priv:""" + autocomplete_json[1]["id"] + """ PrivacyContextModel:evaluatesOn ?data.
     ?privacyPolicy PrivacyContextModel:achieves PrivacyContextModel:""" + autocomplete_json[0]["id"] + """;
                    PrivacyContextModel:activatesIn PrivacyContextModel:""" + autocomplete_json[1]["id"] + """;
                    PrivacyContextModel:protects ?data
}"""
    # Create offline_graph if not already defined
    global offline_graph
    if not len(offline_graph):
        offline_graph = init_rdflib()
    sparql_data = sparql_query(offline_graph, queue)
    return sparql_data


@app.route("/initSparqlPreparation", methods=["GET"])
def initSparqlPreparation():
    """Inits the offline graph and returns the autocomplete items 

    This method is executed when the frontend App is rendered. It initiliazes the offline_graph
    via RDFlib with the saved turtle files in "../offline_lib/ttl_files". Afterwards it executes
    2 Sparql querys with the purpose to fill the autocomplete component with Situation-items and 
    PrivacyProperty-items.

    - **parameters**, **return**::

        :return json_return: Returns the autocomplete items for Siutations and PrivacyProperties
    """
    init_query_1 = "SELECT * WHERE{?vehicleDataSubclasses rdfs:subClassOf PrivacyContextModel:VehicleData.?data a ?vehicleDataSubclasses.?dataDependency PrivacyContextModel:among ?data}"
    init_query_2 = ("SELECT ?service ?vehicleData WHERE{?service a PrivacyContextModel:Service." +
               "?service PrivacyContextModel:requestsDataFrom ?vehicleComponent." +
               "?component PrivacyContextModel:belongsToVehicleComponent ?vehicleComponent." +
               "?component PrivacyContextModel:produces ?vehicleData." +
               "} ORDER BY ?service")
    init_query_3 = "SELECT * WHERE{?situation a PrivacyContextModel:Situation.}"
    sparql_id_data = ""
    sparql_id_data_2 = ""
    global offline_graph
    # Create offline_graph if not already defined
    if not len(offline_graph):
        offline_graph = init_rdflib()
    sparql_id_data_1 = json.loads(sparql_query(offline_graph, init_query_1).decode('utf-8'))
    sparql_id_data_2 = json.loads(sparql_query(offline_graph, init_query_2).decode('utf-8'))
    sparql_id_data_3 = json.loads(sparql_query(offline_graph, init_query_3).decode('utf-8'))
    json_return = {"data": sparql_id_data_1, "service": sparql_id_data_2, "situation": sparql_id_data_3}
    return json_return


@app.route("/getNamespaces", methods=["GET"])
def getNamespaces():
    """Get the Namespace either online or offline

    :return: Namespace in JSON

    """

    return get_namespace_offline(offline_graph)


def get_namespace_offline(offline_graph):
    """Get the Namespace either online or offline

    :return: Namespace in JSON

    """
    return init_namespaces(offline_graph)
