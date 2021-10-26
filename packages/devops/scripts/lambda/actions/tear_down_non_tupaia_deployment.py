# Terminates an instance and any associated elastic ip, route53 entries, load balancer, and gateway
#
# Example config
# {
#   "Action": "tear_down_non_tupaia_deployment",
#   "InstanceName": "tonga: wai-965"
# }

from helpers.teardown import teardown_instance
from helpers.utilities import get_instance

def tear_down_non_tupaia_deployment(event):
    if 'InstanceName' not in event:
      raise Exception('Must provide InstanceName when tearing down an instance')

    filters = [
      { 'Name': 'tag:Name', 'Values': [event['InstanceName']] },
      { 'Name': 'instance-state-name', 'Values': ['running', 'stopped'] }, # ignore terminated instances
    ]
    instance = get_instance(filters)

    if not instance:
      raise Exception('No matching instance found')

    teardown_instance(instance)

    print('Finished tearing down clone')
