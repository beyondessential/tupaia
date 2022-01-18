# Creates a new Tupaia database instance
#
# Example configs
#
# 1. Spin up a new database instance
# {
#   "Action": "spin_up_tupaia_database",
#   "User": "rohan",
#   "DeploymentName": "rn-195-epic",
#   "CloneDbFrom": "dev",
#   "DbInstanceType": "t4g.medium"
# }

from helpers.creation import create_db_instance_from_snapshot

def spin_up_tupaia_database(event):
    # validate input config
    if 'DeploymentName' not in event:
        raise Exception('You must include the key "DeploymentName" in the lambda config, e.g. "dev".')
    deployment_name = event['DeploymentName']

    # get manual input parameters, or default for any not provided
    db_instance_type = event.get('DbInstanceType', 't4g.medium')
    security_group_code = event.get('SecurityGroupCode', 'tupaia-dev-sg') # Use security group tagged with code
    clone_db_from = event.get('CloneDbFrom', 'production') # Use volume snapshot tagged with deployment name

    # create db instance from a snapshot
    # do this after the server has started because it will take a while to populate the db from the snapshot, 
    # so we might as well be cloning the db instance at the same time, so long is it is available before
    # the server first tries to connect
    create_db_instance_from_snapshot(
        deployment_name,
        'tupaia',
        clone_db_from,
        db_instance_type,
        security_group_code
    )