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
