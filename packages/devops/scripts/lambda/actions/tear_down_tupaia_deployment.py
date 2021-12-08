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
from helpers.rds import delete_db_instance

def tear_down_tupaia_deployment(event):
    if 'DeploymentName' not in event:
        raise Exception('You must include "DeploymentName" in the lambda config, which is the subdomain of tupaia.org you want to tear down (e.g. "dev").')

    instance_filters = [
      { 'Name': 'tag:DeploymentName', 'Values': [event['DeploymentName']] },
      { 'Name': 'instance-state-name', 'Values': ['running', 'stopped']} # ignore terminated instances
    ]
    instances = find_instances(instance_filters)

    if len(instances) == 0:
      raise Exception('No matching instances found')

    print('Tearing down the instances ' + ', '.join([get_tag(instance, 'Name') for instance in instances]))

    for instance in instances:
      teardown_instance(instance)
      delete_db_instance(instance)

    print('Finished tearing down clone')
