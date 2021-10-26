import boto3
import asyncio
import functools
import re

ec2 = boto3.resource('ec2')
ec = boto3.client('ec2')
iam = boto3.client('iam')

loop = asyncio.get_event_loop()


def get_account_ids():
    account_ids = list()
    try:
        account_ids.append(iam.get_user()['User']['Arn'].split(':')[4])
    except Exception as e:
        # use the exception message to get the account ID the function executes under
        account_ids.append(re.search(r'(arn:aws:sts::)([0-9]+)', str(e)).groups()[1])

    return account_ids

def get_tag(instance, tag_name):
    try:
        tag_value = [
            t.get('Value') for t in instance['Tags']
            if t['Key'] == tag_name][0]
    except IndexError:
        tag_value = ''
    return tag_value

def add_tag(instance_id, tag_name, tag_value):
    ec.create_tags(
        Resources=[instance_id],
        Tags=[{
            'Key': tag_name,
            'Value': tag_value
        }]
    )

def get_instance(filters):
    reservations = ec.describe_instances(
        Filters=filters
    ).get(
        'Reservations', []
    )
    return reservations[0]['Instances'][0]

def find_instances(filters):
    reservations = ec.describe_instances(
        Filters=filters
    ).get(
        'Reservations', []
    )
    return sum(
          [
              [i for i in r['Instances']]
              for r in reservations
          ], [])

def tags_contains(tags, key, value):
    tags_matching_key = list(filter(lambda x: x['Key'] == key, tags))
    if len(tags_matching_key) == 0:
        return False
    tag_matching_key = tags_matching_key[0]
    return tag_matching_key['Value'] == value



async def wait_for_instance(instance_id, to_be):
    volume_available_waiter = ec.get_waiter('instance_' + to_be)
    await loop.run_in_executor(None, functools.partial(volume_available_waiter.wait, InstanceIds=[instance_id]))


async def stop_instance(instance):
    instance_object = ec2.Instance(instance['InstanceId'])
    instance_object.stop()
    print('Stopping instance ' + instance_object.id)
    await wait_for_instance(instance_object.id, 'stopped')
    print('Stopped instance with id ' + instance_object.id)


async def start_instance(instance):
    instance_object = ec2.Instance(instance['InstanceId'])
    instance_object.start()
    print('Starting instance ' + instance_object.id)
    await wait_for_instance(instance_object.id, 'running')
    print('Started instance with id ' + instance_object.id)
