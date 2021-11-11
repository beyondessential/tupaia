# Creates snapshots of volumes of instances.
#
# Example configs
#
# 1. Snapshot all instances that have been marked with the "Backup" tag:
# {
#   "Action": "backup_instances"
#   "User": "edwin",
# }
#
# 2. Snapshot a specific instance
# {
#   "Action": "backup_instances",
#   "User": "edwin",
#   "InstanceName": "Tupaia Tonga Aggregation Server"
# }

import boto3
import datetime
from helpers.utilities import get_tag

ec = boto3.client('ec2')

def backup_instances(event):

    # ignore terminated instances
    filters = [{ 'Name': 'instance-state-name', 'Values': ['running', 'stopped'] }]

    if 'InstanceName' in event:
        print('Only backing up ' + event['InstanceName'])
        filters.append({'Name': 'tag:Name', 'Values': [event['InstanceName']]})
    else:
        print('Backing up all instances tagged "Backup')
        filters.append({'Name': 'tag-key', 'Values': ['backup', 'Backup']})

    reservations = ec.describe_instances(
        Filters=filters
    ).get(
        'Reservations', []
    )

    instances = sum(
        [
            [i for i in r['Instances']]
            for r in reservations
        ], [])

    if len(instances) == 0:
        print('Found no instances to back up. Make sure the instance has the tag "Backup"')


    for instance in instances:

        instance_name = get_tag(instance, 'Name')
        deployment_name = get_tag(instance, 'DeploymentName')
        retention_days = get_tag(instance, 'Retention')

        if retention_days == '':
            retention_days = '7' # default to 7 days of snapshot retention

        print('Backing up ' + instance_name)

        for dev in instance['BlockDeviceMappings']:
            if dev.get('Ebs', None) is None:
                continue
            vol_id = dev['Ebs']['VolumeId']

            snap = ec.create_snapshot(
                VolumeId=vol_id,
                Description='Backup created from ' + instance_name,
            )

            delete_date = datetime.date.today() + datetime.timedelta(days=int(retention_days))
            delete_fmt = delete_date.strftime('%Y-%m-%d')

            snapshot_tags = [
                {'Key': 'DeleteOn', 'Value': delete_fmt},
                {'Key': 'DeploymentName', 'Value': deployment_name}
            ]

            deployment_name = get_tag(instance, 'DeploymentName')
            if deployment_name != '':
                snapshot_tags.append({'Key': 'DeploymentName', 'Value': deployment_name})

            ec.create_tags(
                Resources=[snap['SnapshotId']],
                Tags=snapshot_tags
            )
