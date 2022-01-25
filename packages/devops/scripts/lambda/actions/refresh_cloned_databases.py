# Replaces the RDS database with the latest snapshot of the instance it has been cloned from
#
# Example configs
#
# 1. Refresh all cloned databases (i.e. those with the tag "ClonedFrom")
# {
#   "Action": "refresh_cloned_databases",
#   "User": "edwin"
# }
#
# 2. Refresh all databases cloned from a specific base, e.g. dev
# {
#   "Action": "refresh_cloned_databases",
#   "User": "edwin",
#   "ClonedFrom": "dev"
# }
#
# 3. Refresh a specific database
# {
#   "Action": "refresh_cloned_databases",
#   "User": "edwin",
#   "DeploymentName": "edwin-test"
# }


import asyncio

from helpers.creation import create_db_instance_from_snapshot_async
from helpers.teardown import teardown_db_instance
from helpers.rds import find_db_instances, wait_for_db_instance, set_db_instance_master_password
from helpers.secrets import get_db_master_password

loop = asyncio.get_event_loop()

def refresh_cloned_databases(event):
    filters = [
        { 'Key': 'ClonedFrom' }
    ]
    if 'ClonedFrom' in event:
      print('Refreshing databases cloned from ' + event['ClonedFrom'])
      filters[0]['Values'] = [event['ClonedFrom']]
    if 'DeploymentName' in event:
      print('Refreshing the ' + event['DeploymentName'] + ' clone')
      filters.append({'Key': 'DeploymentName', 'Values': [event['DeploymentName']]})

    instances = find_db_instances(filters)
    
    if len(instances) == 0:
      print('No clones to refresh')
      return

    print('refreshing ' + str(len(instances)) + ' databases')

    delete_tasks = sum(
    [
        [asyncio.ensure_future(delete_db(instance)) for instance in instances]
    ], [])
    loop.run_until_complete(asyncio.wait(delete_tasks))

    recreate_tasks = sum(
    [
        [asyncio.ensure_future(recreate_db(instance)) for instance in instances]
    ], [])
    loop.run_until_complete(asyncio.wait(recreate_tasks))

async def delete_db(db_instance):
    db_id = db_instance['DBInstanceIdentifier']
    deployment_name = next(filter(lambda item: item['Key'] == 'DeploymentName', db_instance['TagList']))['Value']

    print('starting delete of: ' + db_id)

    # delete existing db
    teardown_db_instance(deployment_name, 'tupaia')
    await wait_for_db_instance(db_id, 'deleted')
    print('deleted: ' + db_id)

async def recreate_db(db_instance):
    db_id = db_instance['DBInstanceIdentifier']
    db_instance_type = db_instance['DBInstanceClass']
    security_group_id = db_instance['VpcSecurityGroups'][0]['VpcSecurityGroupId']
    clone_db_from = next(filter(lambda item: item['Key'] == 'ClonedFrom', db_instance['TagList']))['Value']
    deployment_name = next(filter(lambda item: item['Key'] == 'DeploymentName', db_instance['TagList']))['Value']

    print('starting recreate of: ' + db_id)

    # recreate db instance from a snapshot
    await create_db_instance_from_snapshot_async(
        deployment_name,
        'tupaia',
        clone_db_from,
        db_instance_type,
        security_group_id
    )

    # set master password
    set_db_instance_master_password(db_id, get_db_master_password())
    
    print('recreated: ' + db_id)
