# Tears down a full Tupaia deployment, including the server instance, the db instance, and the
# associated elastic ips, route53 entries, load balancer, and gateway
#
# Example configs
#
# 1. Tear down a specific branch deployment of Tupaia
# {
#   "Action": "tear_down_tupaia_deployment",
#   "User": "edwin",
#   "Branch": "wai-965"
# }
#
# 1. Tear down a Tupaia deployment using its deployment name (which is usually the same as the branch)
# {
#   "Action": "tear_down_tupaia_deployment",
#   "User": "edwin",
#   "DeploymentName": "wai-965"
# }

from helpers.teardown import teardown_instance
from helpers.utilities import find_instances, get_tag

def tear_down_tupaia_deployment(event):
    instance_filters = [
      { 'Name': 'instance-state-name', 'Values': ['running', 'stopped']} # ignore terminated instances
    ]

    if 'Branch' not in event and 'DeploymentName' not in event:
        raise Exception('You must include either "DeploymentName" or "Branch" in the lambda config, e.g. "dev".')

    if 'Branch' in event:
        instance_filters.append({ 'Name': 'tag:Branch', 'Values': [event['Branch']] })

    if 'DeploymentName' in event:
        instance_filters.append({ 'Name': 'tag:DeploymentName', 'Values': [event['DeploymentName']] })

    instances = find_instances(instance_filters)

    if len(instances) == 0:
      raise Exception('No matching instances found')

    print('Tearing down the instances ' + ', '.join([get_tag(instance, 'Name') for instance in instances]))

    for instance in instances:
      teardown_instance(instance)

    print('Finished tearing down clone')
