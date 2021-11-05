# Creates a new deployment of DHIS2 hosted within the tupaia.org domain
#
# Example configs
#
# 1. Spin up new deployment of Tonga DHIS2
# {
#   "Action": "spin_up_dhis_deployment",
#   "User": "edwin",
#   "DeploymentName": "tonga-for-testing",
#   "InstanceType": "t3a.medium",
#   "FromDeployment": "tonga"
# }

from helpers.clone import clone_instance

def spin_up_dhis_deployment(event):
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

    instance_name_prefix = 'Clone of ' + from_deployment + ': '

    extra_tags = [{ 'Key': 'DeployedBy', 'Value': event['User'] }]

    clone_instance(from_deployment, deployment_name, instance_type, extra_tags=extra_tags, instance_name_prefix=instance_name_prefix)

    print('Deployment cloned')
