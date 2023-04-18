import json


def load_json(file_path):
    with open(file_path, "r") as file:
        json_data = json.load(file)
    return json_data


def write_json(json_object, file_path):
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(json_object, file, ensure_ascii=False, indent=4)
        file.write("\n")
