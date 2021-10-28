# Swaps an ELB to point at a new tupaia server, and kills the old one for a given branch. This is
# called by the startup script on the instance as the second phase of "redeploy_tupaia_server", and
# shouldn't generally be used directly
#
# Example configs
#
# 1. Swap out new production instance in place of old
# {
#   "Action": "swap_out_tupaia_server",
#   "Branch": "production"
# }
#
# 2. Swap out using a specific deployment code
# {
#   "Action": "swap_out_tupaia_server",
#   "Branch": "wai-965"
#   "ServerDeploymentCode": "edwin-test"
# }
# N.B. example 2 is unusual and generally just used for debugging the redeploy process itself.

from helpers.networking import get_instance_behind_gateway, swap_gateway_instance
from helpers.teardown import terminate_instance
from helpers.utilities import add_tag, get_tag, get_instance_by_id

def swap_out_tupaia_server(event):
    # validate input config
    if 'Branch' not in event:
        raise Exception('You must include the key "Branch" in the lambda config, e.g. "dev".')
    branch = event['Branch']

    if 'NewInstanceId' not in event:
        raise Exception('You must include the key "NewInstanceId" in the lambda config, e.g. "dev".')
    new_instance_id = event['NewInstanceId']

    new_instance = get_instance_by_id(new_instance_id)
    if not new_instance:
        raise Exception('Could not find new instance to swap in')

    old_instance = get_instance_behind_gateway(branch)
    if not old_instance:
      raise Exception('Could not find old instance to swap out')

    # set up ELB from the old instance to point at the new one
    swap_gateway_instance(branch, old_instance['InstanceId'], new_instance_id)

    # add the subdomain tags that now relate to the new instance
    add_tag(new_instance_id, 'SubdomainsViaGateway', get_tag(old_instance, 'SubdomainsViaGateway'))

    terminate_instance(old_instance)

    print('Successfully swapped out ' + branch)
