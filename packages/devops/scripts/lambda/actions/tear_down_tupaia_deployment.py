# Tears down a full Tupaia deployment, including the server instance, the db instance, and the
# associated elastic ips, route53 entries, load balancer, and gateway
#
# Example configs
#
# 1. Tear down a specific branch deployment of Tupaia
# {
#   "Action": "tear_down_tupaia_deployment",
#   "Branch": "wai-965"
# }
#
# 2. Tear down a deployment of Tupaia, but which was spun up based on a non-standard AMI etc. (see
# example 3 in "spin_up_tupaia_deployment" for more info of when this is used)
# {
#   "Action": "tear_down_tupaia_deployment",
#   "Branch": "wai-965",
#   "ServerDeploymentCode": "edwin-test",
#   "DbDeploymentCode": "edwin-test"
# }

from helpers.teardown import teardown_instance
from helpers.utilities import get_instances

def tear_down_tupaia_deployment(event):
    if 'Branch' not in event:
      raise Exception('Must provide Branch when tearing down a Tupaia deployment')
    branch = event['Branch']
    server_deployment_code = event.get('ServerDeploymentCode', 'tupaia-server') # default to "tupaia-server"
    db_deployment_code = event.get('DbDeploymentCode', 'tupaia-db') # default to "tupaia-db"

    instances = get_instances([
      { 'Name': 'tag:Code', 'Values': [server_deployment_code, db_deployment_code] },
      { 'Name': 'tag:Stage', 'Values': [branch] }
    ])

    if len(instances) == 0:
      raise Exception('No matching instances found')

    for instance in instances:
      teardown_instance(instance['InstanceName'])

    print('Finished tearing down clone')
