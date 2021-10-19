import boto3
import asyncio
import functools

from utilities.utilities import *

ec = boto3.client('ec2')

loop = asyncio.get_event_loop()

async def wait_for_volume(volume_id, to_be):
    volume_available_waiter = ec.get_waiter('volume_' + to_be)
    await loop.run_in_executor(None, functools.partial(volume_available_waiter.wait, VolumeIds=[volume_id]))

def get_latest_snapshot_id(account_ids, code):
    filters = [
        {'Name': 'tag:RestoreCode', 'Values': [code]},
    ]
    snapshot_response = ec.describe_snapshots(OwnerIds=account_ids, Filters=filters)
    if 'Snapshots' not in snapshot_response or len(snapshot_response['Snapshots']) == 0:
        print('No snapshots to restore from, cancelling')
        return
    snapshot_id = sorted(snapshot_response['Snapshots'], key=lambda k: k['StartTime'], reverse=True)[0]['SnapshotId']
    print('Found snapshot with id ' + snapshot_id)
    return snapshot_id

async def restore_instance(account_ids, instance):
    print('Restoring instance {}'.format(instance['InstanceId']))
    # Check it's not protected
    protected = get_tag(instance, 'Protected')
    name = get_tag(instance, 'Name')
    if protected == 'true':
        raise Exception('The instance ' + name + ' is protected and cannot be wiped and restored')

    # Get snapshot to restore volume from
    code = get_tag(instance, 'Code')
    snapshot_id = get_latest_snapshot_id(account_ids, code)

    # Get the device on the instance that the volume should restore to
    for dev in instance['BlockDeviceMappings']:
        if dev.get('Ebs', None) is None:
            continue
        dev_to_attach = dev
    print('Will attach to ' + dev_to_attach['DeviceName'])

    # Detach the old volume
    old_vol_id = dev_to_attach['Ebs']['VolumeId']
    old_volume = ec2.Volume(old_vol_id)
    availability_zone = old_volume.availability_zone
    old_volume.detach_from_instance()
    await wait_for_volume(old_vol_id, 'available')
    print('Volume with id ' + old_vol_id + ' detached')

    # Create new volume from snapshot and attach it to EC2 instance
    new_volume_id = ec.create_volume(SnapshotId=snapshot_id, AvailabilityZone=availability_zone, VolumeType=old_volume.volume_type)['VolumeId']
    await wait_for_volume(new_volume_id, 'available')
    print('Created volume with id ' + new_volume_id)

    # Delete old volume, don't need to wait
    old_volume.delete()
    print('Deleting old volume')

    # Attach new volume to instance
    new_volume = ec2.Volume(new_volume_id)
    new_volume.attach_to_instance(InstanceId=instance['InstanceId'], Device=dev_to_attach['DeviceName'])
    await wait_for_volume(new_volume_id, 'in_use')
    print('Attached restored volume to instance')

    # Ensure EBS volumes are deleted on termination of instance
    ec.modify_instance_attribute(InstanceId=instance['InstanceId'], BlockDeviceMappings=[{'DeviceName': dev_to_attach['DeviceName'], 'Ebs': { 'VolumeId': new_volume_id, 'DeleteOnTermination': True }}])


def clone_instance(account_ids, code, stage, instance_type):
  print('Creating ' + instance_type + ' clone of ' + code + ' for branch ' + stage)
  base_instance_filters = [
    { 'Name': 'tag:RestoreCode', 'Values': [code] }
  ]
  base_instance = get_instances(base_instance_filters)[0]
  new_instance = create_instance(code, instance_type, stage, iam_role_arn=base_instance['IamInstanceProfile']['Arn'], base_instance=base_instance)
  loop.run_until_complete(stop_instance(new_instance))
  loop.run_until_complete(restore_instance(account_ids, new_instance))
  loop.run_until_complete(start_instance(new_instance))
  return new_instance
