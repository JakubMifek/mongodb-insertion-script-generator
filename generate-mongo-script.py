#############################################################
## Generate insertion script from given CSVs
#############################################################

import os
import csv
import re
import json
from dateutil import parser as date
from datetime import datetime

directory = 'csvs'
x = 1

class Domain:
    def __init__(self, name):
        self.tables = {}
        self.name = name

    def __getitem__(self, name):
        return self.tables.__getitem__(name)

    def __iter__(self):
        return self.tables.__iter__()

    def add_table(self, name, table):
        self.tables[name] = table

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return '{{ {} }}'.format(', '.join(['{}: {}'.format(x, self.tables[x]) for x in self.tables]))

def load_domains():
    domains = {}
    for filename in os.listdir(directory):
        print('Processing domain: "{}"'.format(filename))

        domains[filename] = Domain(filename)
        models_directory = '{}/{}'.format(directory, filename)
        for csv_file in os.listdir(models_directory):
            if not csv_file.endswith(".csv"):
                continue

            print('Processing model contained in file: "{}"'.format(csv_file))
            name = csv_file[:-4]

            with open('{}/{}'.format(models_directory, csv_file)) as f:
                reader = csv.DictReader(f)
                domains[filename].add_table(name, list(reader))

    return domains

def get_guid(k, v, domains, domain, table):
    global x
    guid = '0000-0000-00000-00000{}'.format(x)
    x += 1

    # find all references to this guid
    referenced = []
    #print('Looking for references across domains for {}'.format(v))
    for domain in domains:
        #print('Looking in domain {}...'.format(domain))
        tables = domains[domain]
        for tbl in tables:
            #print('Checking table {}...'.format(tbl))
            #print('Keys: {}'.format(tables[tbl][0]))
            #print('Info: {}, {}'.format(table, k))
            keys = [key for key in tables[tbl][0] if (table in tables[tbl][0][key] and k in tables[tbl][0][key])]
            if any(keys):
                #print('Keys to reference: {}'.format(keys))
                referenced.append((tables[tbl], keys))

    # replace all references to the current value
    for (tbl, keys) in referenced:
        for row in tbl:
            for key in keys:
                #print('Checking {} against {}'.format(row[key], v))
                if v in row[key]:
                    if type(row[key]) == str:
                        row[key] = row[key].replace(v, guid)
                    else: # list
                        row[key].remove(v)
                        row[key].append(guid)

    return guid

def get_string(k, v, domains, domain, table):
    if v != '' and v != None:
        return v

    return 'unknown'

def get_number(k, v, domains, domain, table):
    if v != '' and v != None:
        return float(v)

    return 0

def get_boolean(k, v, domains, domain, table):
    if v != '' and v != None:
        return bool(v)

    return False

def get_date(k, v, domains, domain, table):
    if v != '' and v != None:
        return date.parse(v).isoformat()

    return datetime.now().isoformat()

default_switch = {
        'guid': get_guid,
        'string': get_string,
        'number': get_number,
        'boolean': get_boolean,
        'date': get_date
        }

def generate_field_values(domains):
    for domain in domains: # for each domain
        print('Generating field values for domain {}...'.format(domain))
        tables = domains[domain]
        # print('Working with tables {}'.format(tables))
        for table in tables: # for each table in the domain
            print('Generating field values for table {}...'.format(table))
            rows = tables[table]
            # print('Working with rows {}'.format(rows))
            default = rows[0]
            for row in rows: # for each row in the table
                if row == default:
                    continue

                for key in row: # fix up values by their type
                    dv = default[key]
                    value = row[key]  
                    #print('Handling value: {{ {}: {} }}'.format(key, value))

                    if dv in default_switch:
                        value = default_switch[dv](key, value, domains, domain, table) # fix value if needed
                    elif value == '' or value == None:
                        if re.match(r"^\[.*\]$", dv):
                            value = []
                        else:
                            value = dv

                    if type(value) == str:
                        if re.match(r'^\[".*"\]$', value):
                            value = list(value[2:-2].split('","'))
                        elif re.match(r'^\[.*\]$', value):
                            value = list(value[1:-1].split(','))
                        #else:
                            #print('Unmatched value: {}'.format(value))

                    #print('Saving value: {}'.format(value))

                    row[key] = value # value was fixed

def find_value_of(domains, D, T, ID):
    if re.match(r'^\[".*"\]$', T):
        T = list(T[2:-2].split('","'))
    elif re.match(r'^\[.*\]$', T):
        T = list(T[1:-1].split(','))
    else:
        print('Unprocessable location {}'.format(T))

    #print('{}: {}'.format(type(T), T))
    possibilities = []
    for t in T:
        if not re.match(r'^[^\.]*\$?[^\.\$]+.[^\.\$]+$', t):
            print('Unprocessable location {}'.format(t))
            continue

        info = [item for i in t.split('$') for item in i.split('.')]
        #print(info)
        if '$' in t:
            d = info[0]
            del info[0]
        else:
            d = D

        table = info[0]
        prpty = info[1]

        rows = domains[d][table]
        possibilities.extend(row for row in rows if row[prpty] == ID)

        if len(possibilities) > 0:
            return possibilities[0]

    return 'Item {}.{}.{} == {} was not found...'.format(d, table, prpty, ID)

def prepare_merged(domains):
    for domain in domains:
        print('Merging data in domain {}...'.format(domain))

        tables = domains[domain]
        for table in tables: # for each table that is relevant for current collection
            print('Merging data in table {}...'.format(table))
            rows = tables[table] # get rows
            default = rows[0] # defalt with mapping

            for row in rows[1:]:
                keys2remove = []
                keys2add = {}

                for key in row:
                    # replace key's value with array of objects
                    if re.match(r'^.*\.merged$', key):
                        #print('matched key: {}'.format(key))
                        ids = row[key]
                        k = key[:-7]
                        v = []
                        for ID in ids:
                            # replace items with associated objects
                            v.append(find_value_of(domains, domain, default[key], ID))

                        keys2remove.append(key)
                        keys2add[k] = v

                    elif re.match(r'^[^\.]+(\.[^\.]+)+$', key):
                        #print('matched key: {}'.format(key))
                        path = key.split('.')
                        #print('path: {}'.format(path))
                        v = row[key]
                        o = keys2add
                        for p in path[:-1]:
                            if p not in o:
                                o[p] = {}
                            o = o[p]
                        o[path[-1]] = v

                        keys2remove.append(key)

                for key in keys2remove:
                    del row[key]
                for key in keys2add:
                    row[key] = keys2add[key]

def generate_mongodb_script(domains):
    branches = ['devel', 'testing', 'master'] # branches
    for domain in domains:
        print('Generating insertion script for domain {}...'.format(domain))

        datatables = {}
        with open('{}/{}/datatables.json'.format(directory, domain)) as j:
            datatables = json.load(j)
        print('Using datatables: {}'.format(datatables))

        for branch in branches: # for each branch
            print('Branch: {}'.format(branch))
            with open('csvs/{}/insertion_script_{}.js'.format(domain, branch), 'w') as script:
                script.write('use {}-{}\n'.format(domain, branch))
                script.write('\n')

                tables = domains[domain]

                collections = set(datatables.values()) # all database's collections that we use
                for collection in collections:
                    #print('Dropping {} collection...'.format(collection))
                    script.write('db.getCollection("{}").drop();\n'.format(collection)) # drop it
                    
                    #print('Adding rows of {} collection...'.format(collection))
                    script.write('const {} = db.getCollection("{}");\n'.format(collection, collection)) # use it

                    script.write('db.{}.insert([\n'.format(collection)) # insert stuff

                    relevant_tables = [table for table in datatables if datatables[table] == collection] # relevant tables from our data structure
                    #print('Relevant tables: {}'.format(relevant_tables))
                    data = []
                    for table in relevant_tables: # for each table that is relevant for current collection
                        rows = tables[table] # get rows
                        data.extend([json.dumps(row, indent=4) for row in rows[1:]]) # change indent or separators if needed

                    script.write(', '.join(data))

                    script.write(']);\n') # end insertion
                    script.write('\n') # trailing empty line for nicer look


def generate_mongo():
    """Generates MongoDB insertion script from given CSVs.
    """
    print('Generating insertion script for MongoDB from given CSVs.')

    domains = load_domains()

    print('---------------')
    print(json.dumps({ domain: domains[domain].__dict__ for domain in domains }, indent=4))
    print('---------------')

    print('Generating values...')
    generate_field_values(domains)

    print('Merging tables...')
    prepare_merged(domains)

    print('---------------')
    print(json.dumps({ domain: domains[domain].__dict__ for domain in domains }, indent=4))
    print('---------------')

    generate_mongodb_script(domains)


if __name__ == '__main__':
    generate_mongo()
