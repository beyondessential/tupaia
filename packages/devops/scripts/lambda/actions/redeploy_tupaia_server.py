# Deploys a new tupaia server (keeping the db) for a given branch. Useful for getting an updated
# version of the code released.
#
# Example configs
#
# 1. Redeploy production (note non-matching branch name), using the same instance size
# {
#   "Action": "redeploy_tupaia_server",
#   "Branch": "production"
# }
#
# 2. Redeploy feature branch, maintaining the same instance size
# {
#   "Action": "redeploy_tupaia_server",
#   "Branch": "wai-965"
# }
#
# 3. Redeploy based on a different AMI, with a different instance size
# {
#   "Action": "redeploy_tupaia_server",
#   "Branch": "wai-965",
#   "InstanceType": "t3a.medium",
#   "ServerDeploymentCode": "edwin-test"
# }
# N.B. example 3 is unusual and generally just used for debugging the redeploy process itself. If
# used, you need to tag the AMI with "Code": "your-code" and add the tag "your-code": "true" to the
# security group

from helpers.create_from_image import create_tupaia_instance_from_image
from helpers.utilities import get_instance

def redeploy_tupaia_server(event):
    # validate input config
    if 'Branch' not in event:
        raise Exception('You must include the key "Branch" in the lambda config, e.g. "dev".')
    branch = event['Branch']

    server_deployment_code = event.get('ServerDeploymentCode', 'tupaia-server') # default to "tupaia-server"

    # find current instance
    existing_instance = get_instance([
        { 'Name': 'tag:Code', 'Values': [server_deployment_code] },
        { 'Name': 'tag:Stage', 'Values': [branch] },
        { 'Name': 'instance-state-name', 'Values': ['running', 'stopped'] } # ignore terminated instances
    ])

    if not existing_instance:
      raise Exception('No existing instance found to redeploy, perhaps you want to spin up a new deployment?')

    instance_type = event.get('InstanceType', existing_instance['InstanceType'])

    security_group_id = existing_instance['SecurityGroups'][0]['GroupId']

    # launch server instance based on gold master AMI
    # original instance will be deleted by lambda script "swap_out_tupaia_server" once new instance is running
    new_instance = create_tupaia_instance_from_image(server_deployment_code, branch, instance_type, setup_gateway=False, security_group_id=security_group_id)

    print('Successfully deployed branch ' + branch)

    return { 'OldInstanceId': existing_instance['InstanceId'], 'NewInstanceId': new_instance['InstanceId'] }
