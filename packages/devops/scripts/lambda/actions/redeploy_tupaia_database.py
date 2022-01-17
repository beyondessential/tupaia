# Drops and recreates a tupaia database instance. Useful for updating to latest snapshot data
#
# Example configs
#
# 1. Drop and redeploy a tupaia database instance
# {
#   "Action": "redeploy_tupaia_database",
#   "DeploymentName": "dev"
# }
#

from helpers.creation import create_db_instance_from_snapshot
from helpers.teardown import teardown_db_instance
from helpers.rds import get_db_instance

def redeploy_tupaia_database(event):
    # validate input config
    if 'DeploymentName' not in event:
        raise Exception('You must include the key "DeploymentName" in the lambda config, e.g. "dev".')
    deployment_name = event['DeploymentName']

    original_instance = get_db_instance('tupaia-' + deployment_name)
    # get manual input parameters, or default for any not provided
    db_instance_type = original_instance['DBInstanceClass']
    security_group_id = original_instance['VpcSecurityGroups'][0]['VpcSecurityGroupId']
    clone_db_from = original_instance['TagList']['ClonedFrom']

    # delete existing db
    teardown_db_instance(deployment_name, 'tupaia') 

    # recreate db instance from a snapshot
    create_db_instance_from_snapshot(
        deployment_name,
        'tupaia',
        clone_db_from,
        db_instance_type,
        security_group_id
    )
