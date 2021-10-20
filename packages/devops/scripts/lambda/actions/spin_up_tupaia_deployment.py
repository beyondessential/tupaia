# Creates a new deployment of Tupaia with a specific branch checked out
#
# Example configs
#
# 1. Spin up a new feature branch deployment of Tupaia
# {
#   "Action": "spin_up_tupaia_deployment",
#   "Branch": "wai-965",
#   "InstanceType": "t3a.medium"
# }
#
# 2. Spin up a new feature branch deployment of Tupaia, but with the db cloned from dev
# {
#   "Action": "spin_up_tupaia_deployment",
#   "Branch": "wai-965",
#   "InstanceType": "t3a.medium",
#   "CloneFromStage": "dev"
# }
#
# 3. Spin up a new deployment of Tupaia, but using a different AMI for the server and different base
#    instance for the db
# {
#   "Action": "spin_up_tupaia_deployment",
#   "Branch": "wai-965",
#   "InstanceType": "t3a.medium",
#   "ServerDeploymentCode": "edwin-test-server",
#   "DbDeploymentCode": "edwin-test-db"
# }
# N.B. example 3 is unusual and generally just used for debugging the redeploy process itself. If
# used, you need to tag the AMI with "Code": "your-code" and add the tag "your-code": "true" to the
# security group


from helpers.clone import clone_instance
from helpers.create_from_image import create_tupaia_instance_from_image

tupaia_server_iam_role_arn = 'arn:aws:iam::843218180240:instance-profile/TupaiaServerRole'
tupaia_subdomains = ['','admin','admin-api','api','config','export','mobile','psss','report-api','psss-api','entity-api','lesmis-api','lesmis']

def spin_up_tupaia_deployment(event):
    # validate input config
    if 'Branch' not in event:
        raise Exception('You must include the key "Branch" in the lambda config, e.g. "dev".')
    branch = event['Branch']

    if 'InstanceType' not in event:
        raise Exception('You must include the key "InstanceType" in the lambda config. We recommend "t3a.medium" unless you need more speed.')
    instance_type = event['InstanceType']

    # launch server instance based on gold master AMI
    server_deployment_code = event.get('ServerDeploymentCode', 'tupaia-server') # default to "tupaia-server"
    create_tupaia_instance_from_image(server_deployment_code, branch, instance_type)

    # clone db instance
    # do this after the server has started because it will take a while to run its startup script, so
    # we might as well be cloning the db instance at the same time, so long is it is available before
    # the server first tries to connect
    db_deployment_code = event.get('DbDeploymentCode', 'tupaia-db') # default to "tupaia-db"
    clone_from_stage = event.get('CloneFromStage', 'production') # default to cloning production
    clone_instance(db_deployment_code, clone_from_stage, branch, instance_type)

    print('Successfully deployed branch ' + branch)
