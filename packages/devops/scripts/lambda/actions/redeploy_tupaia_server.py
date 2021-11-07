# Deploys a new tupaia server (keeping the db) for a given branch. Useful for getting an updated
# version of the code released.
#
# Example configs
#
# 1. Redeploy production (note non-matching branch name), using the same instance size
# {
#   "Action": "redeploy_tupaia_server",
#   "User": "edwin",
#   "DeploymentName": "production",
#   "Branch": "master"
# }
#
# 2. Redeploy feature branch, maintaining the same instance size
# {
#   "Action": "redeploy_tupaia_server",
#   "User": "edwin",
#   "Branch": "wai-965"
# }
#
# 3. Redeploy based on a different AMI, with a different instance size
# {
#   "Action": "redeploy_tupaia_server",
#   "User": "edwin",
#   "Branch": "wai-965",
#   "InstanceType": "t3a.medium",
#   "ImageCode": "edwin-test",
#   "SecurityGroupCode": "edwin-test"
# }
# N.B. example 3 is unusual and generally just used for debugging the redeploy process itself. If
# used, you need to tag the AMI and security groups with the codes you specify

from helpers.create_from_image import create_tupaia_instance_from_image
from helpers.utilities import get_instance, get_tag

def redeploy_tupaia_server(event):
    instance_filters = [
        { 'Name': 'tag:SubdomainsViaDns', 'Values': ['ssh'] }, # the main server rather than db instance (can be removed after RN-195)
        { 'Name': 'instance-state-name', 'Values': ['running', 'stopped'] } # ignore terminated instances
    ]

    branch = event.get('Branch')
    deployment_name = event.get('DeploymentName')

    if not branch and not deployment_name:
        raise Exception('You must include either "DeploymentName" or "Branch" in the lambda config, e.g. "dev".')


    if deployment_name and branch and deployment_name == 'production' and branch != 'master':
            raise Exception('The production deployment branch should not be changed from master to ' + branch)

    if branch:
        instance_filters.append({ 'Name': 'tag:Branch', 'Values': [branch] })

    if deployment_name:
        instance_filters.append({ 'Name': 'tag:DeploymentName', 'Values': [deployment_name] })

    # find current instance
    existing_instance = get_instance(instance_filters)

    if not existing_instance:
      raise Exception('No existing instance found to redeploy, perhaps you want to spin up a new deployment?')

    extra_tags = None
    delete_after = get_tag(existing_instance, 'DeleteAfter')
    if delete_after != '':
        extra_tags = [{ 'Key': 'DeleteAfter', 'Value': delete_after }],

    # launch server instance based on gold master AMI
    # original instance will be deleted by lambda script "swap_out_tupaia_server" once new instance is running
    new_instance = create_tupaia_instance_from_image(
        deployment_name=get_tag(existing_instance, 'DeploymentName'),
        branch=get_tag(existing_instance, 'Branch'),
        instance_type=event.get('InstanceType', existing_instance['InstanceType']),
        extra_tags=extra_tags,
        image_code=event.get('ImageCode', None), # will use id below if not defined in the event
        image_id=existing_instance['ImageId'],
        security_group_code=event.get('SecurityGroupCode', None), # will use id below if not defined in the event
        security_group_id=existing_instance['SecurityGroups'][0]['GroupId'],
        setup_gateway=False,
    )

    print('Successfully deployed ' + get_tag(new_instance, 'DeploymentName'))

    return new_instance['InstanceId']
