# Deploys a new tupaia server (keeping the db) for a given branch, and tears down the old instance.
# Useful for getting an updated version of the code released.
#
# Example configs
#
# 1. Redeploy production (note non-matching branch name)
# {
#   "Action": "redeploy_tupaia_server",
#   "Branch": "production",
#   "InstanceType": "t3.2xlarge"
# }
#
# 2. Redeploy feature branch
# {
#   "Action": "redeploy_tupaia_server",
#   "Branch": "wai-965",
#   "InstanceType": "t3a.medium"
# }
#
# 3. Redeploy based on a different AMI
# {
#   "Action": "redeploy_tupaia_server",
#   "Branch": "wai-965",
#   "InstanceType": "t3a.medium",
#   "ServerDeploymentCode": "edwin-test"
# }
# N.B. example 3 is unusual and generally just used for debugging the redeploy process itself. If
# used, you need to tag the AMI with "Code": "your-code" and add the tag "your-code": "true" to the
# security group

from helpers.networking import swap_gateway_instance
from helpers.teardown import terminate_instance
from helpers.utilities import add_tag, find_instances, get_tag

def swap_out_tupaia_server(event):
    # validate input config
    if 'Branch' not in event:
        raise Exception('You must include the key "Branch" in the lambda config, e.g. "dev".')
    branch = event['Branch']

    server_deployment_code = event.get('ServerDeploymentCode', 'tupaia-server') # default to "tupaia-server"

    # find existing instances, and
    instances = find_instances([
        { 'Name': 'tag:Code', 'Values': [server_deployment_code] },
        { 'Name': 'tag:Stage', 'Values': [branch] },
        { 'Name': 'instance-state-name', 'Values': ['running', 'stopped'] } # ignore terminated instances
    ])

    if not instances or len(instances) == 0:
      raise Exception('No instances found to swap out')

    if not instances or len(instances) == 1:
      raise Exception('To swap out Tupaia server, there should be two instances (the new and the old)')

    sorted_instances = sorted(instances, key=lambda k: k['LaunchTime'])
    old_instance = sorted_instances[0]
    new_instance = sorted_instances[1]

    # set up ELB from the old instance to point at the new one
    swap_gateway_instance(branch, old_instance['InstanceId'], new_instance['InstanceId'])

    # add the subdomain tags that now relate to the new instance
    add_tag(new_instance, get_tag(old_instance, 'SubdomainsViaGateway'))

    terminate_instance(old_instance)

    print('Successfully swapped out ' + branch)
