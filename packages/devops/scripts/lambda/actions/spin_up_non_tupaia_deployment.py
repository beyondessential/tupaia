# Creates a new deployment of DHIS2 or another EC2 instance hosted within the tupaia.org domain, but
# not Tupaia proper (which has a separate file, see spin_up_tupaia_deployment)
#
# Example configs
#
# 1. Spin up new deployment of Tonga DHIS2
# {
#   "Action": "spin_up_non_tupaia_deployment",
#   "DeploymentName": "tonga-for-testing",
#   "InstanceType": "t3a.medium",
#   "FromDeployment": "tonga"
# }

from helpers.clone import clone_instance

def spin_up_non_tupaia_deployment(event):
    # validate input config
    if 'FromDeployment' not in event:
        raise Exception('You must include the key "FromDeployment" in the lambda config to indicate which database snapshot to use.')
    from_deployment = event['FromDeployment']

    if 'DeploymentName' not in event:
        raise Exception('You must include the key "DeploymentName" in the lambda config, to name the new deployment.')
    deployment_name = event['DeploymentName']

    if 'InstanceType' not in event:
        raise Exception('You must include the key "InstanceType" in the lambda config. We recommend "t3a.medium" unless you need more speed.')
    instance_type = event['InstanceType']

    clone_instance(from_deployment, deployment_name, instance_type)

    print('Deployment cloned')
