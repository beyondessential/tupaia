from helpers.teardown import *

def tear_down_non_tupaia_deployment(event):
    if 'InstanceName' not in event:
      raise Exception('Must provide InstanceName when tearing down an instance')

    teardown_instance(event['InstanceName'])

    print('Finished tearing down clone')
