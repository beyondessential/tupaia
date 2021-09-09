import boto3
import asyncio
import time
from utilities import *

ec2 = boto3.resource('ec2')
ec = boto3.client('ec2')
iam = boto3.client('iam')
route53 = boto3.client('route53')
loop = asyncio.get_event_loop()


def lambda_handler(event, context):
    hour = time.strftime("%H:00")
    instances = find_instances([
        { 'Name': 'tag:StartAtUTC', 'Values': [hour] },
        { 'Name': 'instance-state-name', 'Values': ['stopped'] }
    ])

    if len(instances) > 0:
      tasks = sum(
      [
          [asyncio.ensure_future(start_instance(instance)) for instance in instances]
      ], [])
      loop.run_until_complete(asyncio.wait(tasks))
      print('All previously stopped instances started')
    else:
      print('No stopped instances required starting')
