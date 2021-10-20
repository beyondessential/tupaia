import boto3
import datetime
from helpers.utilities import *

ec = boto3.client('ec2')

def backup_instances(event):
    filters = [
        {'Name': 'tag-key', 'Values': ['backup', 'Backup']},
    ]
    if 'InstanceName' in event:
      print('Only backing up ' + event['InstanceName'])
      filters.append({'Name': 'tag:Name', 'Values': [event['InstanceName']]})
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
        try:
            retention_days = [
                int(t.get('Value')) for t in instance['Tags']
                if t['Key'] == 'Retention'][0]
        except IndexError:
            retention_days = 7
        try:
            instance_name = [
                t.get('Value') for t in instance['Tags']
                if t['Key'] == 'Name'][0]
        except IndexError:
            instance_name = 'Unnamed Instance'
        try:
            code = [
                t.get('Value') for t in instance['Tags']
                if t['Key'] == 'Code'][0]
        except IndexError:
            code = ''

        print('Backing up ' + instance_name)

        for dev in instance['BlockDeviceMappings']:
            if dev.get('Ebs', None) is None:
                continue
            vol_id = dev['Ebs']['VolumeId']

            snap = ec.create_snapshot(
                VolumeId=vol_id,
                Description='Backup created from ' + instance_name,
            )

            delete_date = datetime.date.today() + datetime.timedelta(days=retention_days)
            delete_fmt = delete_date.strftime('%Y-%m-%d')

            snapshot_tags = [
                {'Key': 'DeleteOn', 'Value': delete_fmt},
                {'Key': 'Code', 'Value': code}
            ]

            instance_stage = get_tag(instance, 'Stage')
            if instance_stage != '':
                snapshot_tags.append({'Key': 'Stage', 'Value': instance_stage})

            ec.create_tags(
                Resources=[snap['SnapshotId']],
                Tags=snapshot_tags
            )
