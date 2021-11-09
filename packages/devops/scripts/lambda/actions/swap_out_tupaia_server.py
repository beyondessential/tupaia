# Swaps an ELB to point at a new tupaia server, and kills the old one for a given branch. This is
# called by the startup script on the instance as the second phase of "redeploy_tupaia_server", and
# shouldn't generally be used directly

from helpers.networking import get_instance_behind_gateway, swap_gateway_instance
from helpers.teardown import terminate_instance
from helpers.utilities import add_tag, get_tag, get_instance_by_id

def swap_out_tupaia_server(event):
    # validate input config
    if 'DeploymentName' not in event:
        raise Exception('You must include the key "DeploymentName" in the lambda config, e.g. "dev".')
    deployment_name = event['DeploymentName']

    if 'NewInstanceId' not in event:
        raise Exception('You must include the key "NewInstanceId" in the lambda config, e.g. "dev".')
    new_instance_id = event['NewInstanceId']

    new_instance = get_instance_by_id(new_instance_id)
    if not new_instance:
        raise Exception('Could not find new instance to swap in')

    old_instance = get_instance_behind_gateway(deployment_name)
    if not old_instance:
      raise Exception('Could not find old instance to swap out')

    # set up ELB from the old instance to point at the new one
    swap_gateway_instance(deployment_name, old_instance['InstanceId'], new_instance_id)

    terminate_instance(old_instance)

    # add the subdomain tags that now relate to the new instance
    add_tag(new_instance_id, 'SubdomainsViaGateway', get_tag(old_instance, 'SubdomainsViaGateway'))

    print('Successfully swapped out ' + deployment_name)
