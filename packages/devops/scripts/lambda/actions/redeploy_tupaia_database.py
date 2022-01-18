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

import asyncio

from helpers.creation import create_db_instance_from_snapshot
from helpers.teardown import teardown_db_instance
from helpers.rds import get_db_instance, wait_for_db_instance

loop = asyncio.get_event_loop()

def redeploy_tupaia_database(event):
    # validate input config
    if 'DeploymentName' not in event:
        raise Exception('You must include the key "DeploymentName" in the lambda config, e.g. "dev".')
    deployment_name = event['DeploymentName']

    db_id = 'tupaia-' + deployment_name
    db_instance = get_db_instance(db_id)
    # get manual input parameters, or default for any not provided
    db_instance_type = db_instance['DBInstanceClass']
    security_group_id = db_instance['VpcSecurityGroups'][0]['VpcSecurityGroupId']
    clone_db_from = next(filter(lambda item: item['Key'] == 'ClonedFrom', db_instance['TagList']))['Value']

    # rename then delete existing db
    teardown_db_instance(deployment_name, 'tupaia')
    loop.run_until_complete(wait_for_db_instance(db_id, 'deleted'))

    # recreate db instance from a snapshot
    create_db_instance_from_snapshot(
        deployment_name,
        'tupaia',
        clone_db_from,
        db_instance_type,
        security_group_id
    )
