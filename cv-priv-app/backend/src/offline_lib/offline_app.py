from rdflib import Graph
from dotenv import load_dotenv
import os
from src.utils.json_util import load_json

load_dotenv()

def get_ttl_files_dir():
    dir_path = os.path.dirname(__file__)
    lib_path = os.path.join(dir_path, "ttl_files")
    return lib_path
 

def init_rdflib():
    """Initializes the offline Graph

        - **return**::

            :return offline_graph: The offline Graph
    """
    file_list = get_ttl_files()
    offline_graph = init_graph(file_list)
    return offline_graph


def ask_query(offline_graph, query):
    """Performs the ASK query to find the correct namespace prefix

        - **parameters**, **return**::

            :param offline_graph: The offline Graph
            :param query: The ASK query from the Backend
            :return bool(qres): True, if the namespace prefix is correct, else false
    """  
    qres = offline_graph.query(query)
    return bool(qres)

def sparql_query(offline_graph, query):
    """Performs sparql query on the offline Graph

        - **parameters**, **return**::

            :param offline_graph: The offline Graph
            :param query: The Sparql-query form the Backend
            :return qres_json: The Sparql result of the query performed on the offline Graph
    """
    print(query)
    qres = offline_graph.query(query)
    qres_json = qres.serialize(format="json")
    return qres_json
    



def init_namespaces(offline_graph):
    """Get namespaces from the ttl files and return the namespace list

        - **parameters**, **return**::

            :param offline_graph: The offline Graph
            :return namespace_list: The namespaces of the offline Graph
    """
    namespace_list={"namespaces":[]}
    global graph
    for ns_prefix, namespace in offline_graph.namespaces():
        print(ns_prefix)
        print(namespace)
        namespace_list["namespaces"].append({"prefix":ns_prefix, "name": namespace})
    print(namespace_list)
    return namespace_list


def get_ttl_files():
    """Gets the ttl files from the ttl_files directory and puts them in a list

        - **return**::

            :return ttl_file_list: The file list with all ttl files
    """
    ttl_file_list = []
    ttl_lib_dir = get_ttl_files_dir()
    print("-------------------")
    print(ttl_lib_dir)
    print("-------------------")
    for file in os.listdir(ttl_lib_dir):
        if file.endswith(".ttl"):
            ttl_file_list.append((ttl_lib_dir+"/"+file))
    return ttl_file_list


def init_graph(file_list):
    """Initializes the offline Graph

        - **parameters**, **return**::

            :param file_list: The ttl file list
            :return graph: The offline Graph
    """
    graph = Graph()
    for path in file_list:
        graph.parse(path, format='ttl')
    return graph

def init_graph_from_given_data(data):
    """Initializes the offline Graph from given Data

        - **parameters**, **return**::

            :param file_list: The ttl file list
            :return graph: The offline Graph
    """  
    graph = Graph()
    graph.parse(data, format='turtle')
    return graph

def add_namespaces_to_given_graph(namespaces, graph):
    """Adds the namespaces to a given graph

        - **parameters**, **return**::

            :param namespaces: A ttl list of namespaces
            :param graph: The given graph
            :return graph: The graph with namespaces included
    """  
    for i in namespaces["namespaces"]:
        print(i)
        graph.bind(i["prefix"], i["name"])    
    return graph

