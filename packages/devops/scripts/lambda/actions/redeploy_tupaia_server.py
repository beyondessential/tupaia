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

from helpers.create_from_image import create_tupaia_instance_from_image
from helpers.networking import delete_gateway
from helpers.teardown import terminate_instance
from helpers.utilities import get_instances

def redeploy_tupaia_server(event):
    # validate input config
    if 'Branch' not in event:
        raise Exception('You must include the key "Branch" in the lambda config, e.g. "dev".')
    branch = event['Branch']

    if 'InstanceType' not in event:
        raise Exception('You must include the key "InstanceType" in the lambda config. We recommend "t3a.medium" unless you need more speed.')
    instance_type = event['InstanceType']

    server_deployment_code = event.get('ServerDeploymentCode', 'tupaia-server') # default to "tupaia-server"

    # find current instance
    existing_instance = get_instances([
        { 'Name': 'tag:Code', 'Values': [server_deployment_code] },
        { 'Name': 'tag:Stage', 'Values': [branch] },
        { 'Name': 'instance-state-name', 'Values': ['running', 'stopped'] } # ignore terminated instances
    ])[0]

    if not existing_instance:
      raise Exception('No existing instance found to redeploy, perhaps you want to spin up a new deployment?')

    # todo wait for tupaia to become available before deleting original, approx 25 mins
    # delete original
    delete_gateway(branch)
    terminate_instance(existing_instance)

    # launch server instance based on gold master AMI
    create_tupaia_instance_from_image(server_deployment_code, branch, instance_type)

    print('Successfully deployed branch ' + branch)
