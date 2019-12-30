import boto3
import collections
import datetime
import re

ec2 = boto3.resource('ec2')
ec = boto3.client('ec2')
iam = boto3.client('iam')

def wait_for_volume(volume_id, to_be):
    volume_available_waiter = ec.get_waiter('volume_' + to_be)
    volume_available_waiter.wait(VolumeIds=[volume_id])

def lambda_handler(event, context):
    reservations = ec.describe_instances(
        Filters=[
            {'Name': 'tag-key', 'Values': ['RestoreFrom']},
        ]
    ).get(
        'Reservations', []
    )

    instances = sum(
        [
            [i for i in r['Instances']]
            for r in reservations
        ], [])


    to_tag = collections.defaultdict(list)

    for instance in instances:

        # Get snapshot to restore volume from
        account_ids = list()
        try:
            account_ids.append(iam.get_user()['User']['Arn'].split(':')[4])
        except Exception as e:
            # use the exception message to get the account ID the function executes under
            account_ids.append(re.search(r'(arn:aws:sts::)([0-9]+)', str(e)).groups()[1])
        try:
            restore_code = [
                t.get('Value') for t in instance['Tags']
                if t['Key'] == 'RestoreFrom'][0]
        except IndexError:
            restore_code = ''
        filters = [
            {'Name': 'tag:RestoreCode', 'Values': [restore_code]},
        ]
        snapshot_response = ec.describe_snapshots(OwnerIds=account_ids, Filters=filters)
        if 'Snapshots' not in snapshot_response or len(snapshot_response['Snapshots']) == 0:
            print('No snapshots to restore from, cancelling')
            return
        snapshot_id = sorted(snapshot_response['Snapshots'], key=lambda k: k['StartTime'], reverse=True)[0]['SnapshotId']
        print('Found snapshot with id ' + snapshot_id)

        # Get the device on the instance that the volume should restore to
        for dev in instance['BlockDeviceMappings']:
            if dev.get('Ebs', None) is None:
                continue
            dev_to_attach = dev
        print('Will attach to ' + dev_to_attach['DeviceName'])

        # Stop the instance being restored
        instance_object = ec2.Instance(instance['InstanceId'])
        instance_object.stop()
        print('Stopping instance ' + instance_object.id)
        instance_object.wait_until_stopped()
        print('Stopped instance with id ' + instance_object.id)

        # Detach the old volume
        old_vol_id = dev_to_attach['Ebs']['VolumeId']
        old_volume = ec2.Volume(old_vol_id)
        availability_zone = old_volume.availability_zone
        old_volume.detach_from_instance()
        wait_for_volume(old_vol_id, 'available')
        print('Volume with id ' + old_vol_id + ' detached')

        # Create new volume from snapshot and attach it to EC2 instance
        new_volume_id = ec.create_volume(SnapshotId=snapshot_id, AvailabilityZone=availability_zone, VolumeType=old_volume.volume_type)['VolumeId']
        wait_for_volume(new_volume_id, 'available')
        print('Created volume with id ' + new_volume_id)

        # Delete old volume, don't need to wait
        old_volume.delete()
        print('Deleting old volume')

        # Attach new volume to instance
        new_volume = ec2.Volume(new_volume_id)
        new_volume.attach_to_instance(InstanceId=instance['InstanceId'], Device=dev_to_attach['DeviceName'])
        wait_for_volume(new_volume_id, 'in_use')
        print('Attached restored volume to instance')

        # Start instance with new volume
        instance_object.start()
        print('Restarting instance')
        instance_object.wait_until_running()
        print('Instance successfully restored')

