# Creates a new deployment of Tupaia with a specific branch checked out
#
# Example configs
#
# 1. Spin up a new feature branch deployment of Tupaia, that will be deleted after 8 hours
# {
#   "Action": "spin_up_tupaia_deployment",
#   "User": "edwin",
#   "Branch": "wai-965",
#   "HoursOfLife": "8"
# }
#
# 2. Spin up a new deployment of Tupaia, but with the db cloned from dev and a different branch
#    checked out (wai-965) to its url prefix (timing-test), and specifying the instance type
# {
#   "Action": "spin_up_tupaia_deployment",
#   "User": "edwin",
#   "DeploymentName": "timing-test",
#   "Branch": "wai-965",
#   "CloneDbFrom": "dev",
#   "InstanceType": "t3.2xlarge"
# }
#
# 3. Spin up a new deployment of Tupaia, but using a different AMI for the server and different base
#    instance for the db
# {
#   "Action": "spin_up_tupaia_deployment",
#   "User": "edwin",
#   "Branch": "wai-965",
#   "ImageCode": "edwin-test-server",
#   "SecurityGroupCode": "edwin-test-server",
#   "CloneDbFrom": "edwin-test-db"
# }
# N.B. example 3 is unusual and generally just used for debugging the redeploy process itself. If
# used, you need to tag the AMI and security groups with the codes you specify

from datetime import datetime, timedelta

from helpers.clone import clone_instance
from helpers.create_from_image import create_tupaia_instance_from_image

def spin_up_tupaia_deployment(event):
    # validate input config
    if 'Branch' not in event:
        raise Exception('You must include the key "Branch" in the lambda config, e.g. "dev".')
    branch = event['Branch']
    deployment_name = event.get('DeploymentName', branch) # default to branch if no deployment code set
    if deployment_name == 'production' and branch != 'master':
        raise Exception('The production deployment needs to check out master, not ' + branch)

    # get manual input parameters, or default for any not provided
    instance_type = event.get('InstanceType', 't3a.medium')
    image_code = event.get('ImageCode', 'tupaia-gold-master') # Use AMI tagged with code
    security_group_code = event.get('SecurityGroupCode', 'tupaia-dev-sg') # Use security group tagged with code
    clone_db_from = event.get('CloneDbFrom', 'production') # Use volume snapshot tagged with deployment name

    extra_tags = [{ 'Key': 'DeployedBy', 'Value': event['User'] }]
    if 'HoursOfLife' in event:
        delete_after = datetime.now() + timedelta(hours=event['HoursOfLife'])
        extra_tags.append({ 'Key': 'DeleteAfter', 'Value': format(delete_after, "%Y-%m-%d %H:%M") })

    # launch server instance based on gold master AMI
    create_tupaia_instance_from_image(
        deployment_name,
        branch,
        instance_type,
        extra_tags=extra_tags,
        image_code=image_code,
        security_group_code=security_group_code,
    )

    # clone db instance
    # do this after the server has started because it will take a while to run its startup script, so
    # we might as well be cloning the db instance at the same time, so long is it is available before
    # the server first tries to connect
    clone_instance(
        clone_db_from,
        deployment_name,
        instance_type,
        extra_tags=extra_tags,
        security_group_code=security_group_code,
    )

    print('Successfully deployed branch ' + branch)
