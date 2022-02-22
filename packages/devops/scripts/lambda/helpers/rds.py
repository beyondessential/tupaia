import boto3

from helpers.networking import add_subdomains_to_route53

resource_group_tagging_api = boto3.client('resourcegroupstaggingapi')
rds = boto3.client('rds')

def get_latest_db_snapshot(source_db_id):
    snapshots_response = rds.describe_db_snapshots(
        DBInstanceIdentifier=source_db_id
    )

    if 'DBSnapshots' not in snapshots_response or len(snapshots_response['DBSnapshots']) == 0:
        raise Exception('No snapshots found')

    latest_snapshot_id = sorted(snapshots_response['DBSnapshots'], key=lambda k: k['SnapshotCreateTime'], reverse=True)[0]['DBSnapshotIdentifier']
    print('Found snapshot with id ' + latest_snapshot_id)
    return latest_snapshot_id
