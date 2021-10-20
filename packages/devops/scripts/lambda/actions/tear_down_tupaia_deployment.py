from helpers.teardown import *

def tear_down_tupaia_deployment(event):
    if 'Branch' not in event:
      raise Exception('Must provide Branch when tearing down a Tupaia deployment')
    branch = event['Branch']
    server_deployment_code = event.get('ServerDeploymentCode', 'tupaia_server') # default to "tupaia_server"
    db_deployment_code = event.get('DbDeploymentCode', 'tupaia_db') # default to "tupaia_db"

    instances = get_instances([
      { 'Name': 'tag:Code', 'Values': [server_deployment_code, db_deployment_code] },
      { 'Name': 'tag:Stage', 'Values': [branch] }
    ])

    if len(instances) == 0:
      raise Exception('No matching instances found')

    for instance in instances:
      teardown_instance(instance['InstanceName'])

    print('Finished tearing down clone')
