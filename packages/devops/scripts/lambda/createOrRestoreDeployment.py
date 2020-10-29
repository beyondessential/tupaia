import boto3
import collections
import datetime
import re
import asyncio
import functools

ec2 = boto3.resource('ec2')
ec = boto3.client('ec2')
iam = boto3.client('iam')
route53 = boto3.client('route53')
loop = asyncio.get_event_loop()

async def wait_for_volume(volume_id, to_be):
    volume_available_waiter = ec.get_waiter('volume_' + to_be)
    await loop.run_in_executor(None, functools.partial(volume_available_waiter.wait, VolumeIds=[volume_id]))

async def wait_for_instance(instance_id, to_be):
    volume_available_waiter = ec.get_waiter('instance_' + to_be)
    await loop.run_in_executor(None, functools.partial(volume_available_waiter.wait, InstanceIds=[instance_id]))

def get_latest_snapshot_id(account_ids, restore_code):
    filters = [
        {'Name': 'tag:RestoreCode', 'Values': [restore_code]},
    ]
    snapshot_response = ec.describe_snapshots(OwnerIds=account_ids, Filters=filters)
    if 'Snapshots' not in snapshot_response or len(snapshot_response['Snapshots']) == 0:
        print('No snapshots to restore from, cancelling')
        return
    snapshot_id = sorted(snapshot_response['Snapshots'], key=lambda k: k['StartTime'], reverse=True)[0]['SnapshotId']
    print('Found snapshot with id ' + snapshot_id)
    return snapshot_id

def get_tag(instance, tag_name):
    try:
        tag_value = [
            t.get('Value') for t in instance['Tags']
            if t['Key'] == tag_name][0]
    except IndexError:
        tag_value = ''
    return tag_value

def get_instances(filters):
    reservations = ec.describe_instances(
        Filters=filters
    ).get(
        'Reservations', []
    )
    return reservations[0]['Instances']


async def restore_instance(account_ids, instance):
    print('Restoring instance {}'.format(instance['InstanceId']))
    # Get snapshot to restore volume from
    restore_code = get_tag(instance, 'RestoreFrom')
    snapshot_id = get_latest_snapshot_id(account_ids, restore_code)

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
    await wait_for_instance(instance_object.id, 'stopped')
    print('Stopped instance with id ' + instance_object.id)

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

    # Start instance with new volume
    instance_object.start()
    print('Restarting instance')
    await wait_for_instance(instance_object.id, 'running')
    print('Instance successfully restored')

def build_record_set_change(domain, subdomain, stage, ip_address):
    if (subdomain == ''):
        url = stage + '.' + domain + '.'
    else:
        url = stage + '-' + subdomain + '.' + domain + '.'

    return {
        'Action': 'UPSERT',
        'ResourceRecordSet': {
            'Name': url,
            'Type': 'A',
            'TTL': 300,
            'ResourceRecords': [
                { 'Value': ip_address }
            ]
        }
    }

def create_instance(account_ids, restore_code, stage):
    print('Creating new instance for branch ' + stage + ' of ' + restore_code)

    # Get the (production) instance to base this new instance on
    base_instance_filters = [
      { 'Name': 'tag:RestoreCode', 'Values': [restore_code] },
      { 'Name': 'instance-state-name', 'Values': ['running'] }
    ]
    base_instance = get_instances(base_instance_filters)[0]
    domain = get_tag(base_instance, 'DomainName')
    subdomains_string = get_tag(base_instance, 'Subdomains')
    print('Found instance to base the new one on')

    # Get the security group tagged with the key matching this restore code
    security_group_filters = [
      {'Name': 'tag-key', 'Values': [restore_code]}
    ]
    security_groups = ec.describe_security_groups(
      Filters=security_group_filters
    ).get(
      'SecurityGroups', []
    )
    security_group_ids = [security_group['GroupId'] for security_group in security_groups]
    print('Found security group ids')


    # Create the instance
    instance_creation_config = {
      'ImageId' : base_instance['ImageId'],
      'InstanceType' : base_instance['InstanceType'],
      'SubnetId' : base_instance['SubnetId'],
      'Placement' : base_instance['Placement'],
      'SecurityGroupIds' : security_group_ids,
      'MinCount' : 1,
      'MaxCount' : 1,
      'TagSpecifications' : [{ 'ResourceType': 'instance', 'Tags': [
        { 'Key': 'Name', 'Value': restore_code + ': ' + stage },
        { 'Key': 'Stage', 'Value': stage },
        { 'Key': 'RestoreFrom', 'Value': restore_code },
        { 'Key': 'DomainName', 'Value': domain },
        { 'Key': 'Subdomains', 'Value': subdomains_string }
      ]}]
    }
    # Get details of IAM profile (e.g. role allowing access to lambda) if applicable
    if 'IamInstanceProfile' in base_instance:
        instance_creation_config['IamInstanceProfile'] = { 'Arn': base_instance['IamInstanceProfile']['Arn'] }
    new_instances = ec2.create_instances(**instance_creation_config)
    print('Started new instance creation')

    # Wait until it is ready, then get ip
    new_instance = new_instances[0]
    new_instance.wait_until_running()
    new_instance_object = get_instances([
      {'Name': 'instance-id', 'Values': [new_instance.id]}
    ])[0]
    print('New instance is up')

    # Attach a consistent elastic ip to the instance
    elastic_ip = ec.allocate_address(Domain='Vpc')
    ec.associate_address(AllocationId=elastic_ip['AllocationId'],InstanceId=new_instance_object['InstanceId'])
    public_ip_address = elastic_ip['PublicIp']

    # Set up subdomains on hosted zone and point them at this instance's ip
    subdomains = subdomains_string.split(',')
    print('Creating subdomains pointing to {}'.format(public_ip_address))
    record_set_changes = [build_record_set_change(domain, subdomain, stage, public_ip_address) for subdomain in subdomains]
    print('Generated {} record set changes'.format(len(record_set_changes)))
    hosted_zone_id = route53.list_hosted_zones_by_name(DNSName=domain)['HostedZones'][0]['Id']
    route53.change_resource_record_sets(
        HostedZoneId=hosted_zone_id,
        ChangeBatch={
            'Comment': 'Adding subdomains for ' + stage + ' to ' + domain,
            'Changes': record_set_changes
        }
    )
    print('Submitted changes to hosted zone')

    return new_instance_object


def lambda_handler(event, context):
    account_ids = list()
    try:
        account_ids.append(iam.get_user()['User']['Arn'].split(':')[4])
    except Exception as e:
        # use the exception message to get the account ID the function executes under
        account_ids.append(re.search(r'(arn:aws:sts::)([0-9]+)', str(e)).groups()[1])

    filters = [
        { 'Name': 'tag-key', 'Values': ['RestoreFrom'] },
        { 'Name': 'instance-state-name', 'Values': ['running'] }
    ]
    if 'RestoreFrom' in event:
      print('Restoring instances generated from ' + event['RestoreFrom'])
      filters.append({'Name': 'tag:RestoreFrom', 'Values': [event['RestoreFrom']]})
    if 'Branch' in event:
      print('Restoring the ' + event['Branch'] + ' branch')
      filters.append({'Name': 'tag:Stage', 'Values': [event['Branch']]})
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

    # If there isn't an existing ec2 instance matching the restore code and branch, create it
    if len(instances) == 0 and 'RestoreFrom' in event and 'Branch' in event:
      new_instance = create_instance(account_ids, event['RestoreFrom'], event['Branch'])
      instances = [new_instance]
      print('Finished creating new instance')

    tasks = sum(
    [
        [asyncio.ensure_future(restore_instance(account_ids, instance)) for instance in instances]
    ], [])

    loop.run_until_complete(asyncio.wait(tasks))
    print('Finished restoring all instances')
