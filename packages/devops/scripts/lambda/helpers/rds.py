import boto3

resource_group_tagging_api = boto3.client('resourcegroupstaggingapi')
rds = boto3.client('rds')

def get_db_instance(db_id):
    instances_response = rds.describe_db_instances(
        DBInstanceIdentifier=db_id
    )

    if 'DBInstances' not in instances_response or len(instances_response['DBInstances']) == 0:
        raise Exception('No instance found')

    if len(instances_response['DBInstances']) > 1:
        raise Exception('Multiple instances found')

    return instances_response['DBInstances'][0]

def get_latest_db_snapshot(source_db_id):
    snapshots_response = rds.describe_db_snapshots(
        DBInstanceIdentifier=source_db_id
    )

    if 'DBSnapshots' not in snapshots_response or len(snapshots_response['DBSnapshots']) == 0:
        raise Exception('No snapshots found')

    latest_snapshot_id = sorted(snapshots_response['DBSnapshots'], key=lambda k: k['SnapshotCreateTime'], reverse=True)[0]['DBSnapshotIdentifier']
    print('Found snapshot with id ' + latest_snapshot_id)
    return latest_snapshot_id
