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

def build_record_set_deletion(domain, subdomain, stage, ip_address):
    if (subdomain == ''):
        url = stage + '.' + domain + '.'
    else:
        url = stage + '-' + subdomain + '.' + domain + '.'

    return {
        'Action': 'DELETE',
        'ResourceRecordSet': {
            'Name': url,
            'Type': 'A',
            'TTL': 300,
            'ResourceRecords': [
                { 'Value': ip_address }
            ]
        }
    }

def lambda_handler(event, context):
    account_ids = list()
    try:
        account_ids.append(iam.get_user()['User']['Arn'].split(':')[4])
    except Exception as e:
        # Use the exception message to get the account ID the function executes under
        account_ids.append(re.search(r'(arn:aws:sts::)([0-9]+)', str(e)).groups()[1])

    if 'InstanceName' not in event:
      raise Exception('Must provide InstanceName when deleting an instance')

    filters = [
      { 'Name': 'tag-key', 'Values': ['RestoreFrom'] }, # Ensure it is a 'RestoreFrom' instance, not prod
      { 'Name': 'tag:Name', 'Values': [event['InstanceName']] },
      { 'Name': 'instance-state-name', 'Values': ['running'] }
    ]
    instance = get_instances(filters)[0]

    if not instance:
      raise Exception('No matching instance found')

    # Check it's not protected
    protected = get_tag(instance, 'Protected')
    if protected == 'true':
        raise Exception('The instance ' + event['InstanceName'] + ' is protected and cannot be deleted')

    # Get tagged details of instance
    stage = get_tag(instance, 'Stage')
    domain = get_tag(instance, 'DomainName')
    subdomains_string = get_tag(instance, 'Subdomains')
    subdomains = subdomains_string.split(',')
    public_ip_address = instance['PublicIpAddress']

    # Delete subdomains from hosted zone
    hosted_zone_id = route53.list_hosted_zones_by_name(DNSName=domain)['HostedZones'][0]['Id']
    all_record_sets = route53.list_resource_record_sets(HostedZoneId=hosted_zone_id)['ResourceRecordSets']
    all_record_set_names = [record_set['Name'] for record_set in all_record_sets]
    record_set_deletions = [build_record_set_deletion(domain, subdomain, stage, public_ip_address) for subdomain in subdomains]
    # Filter out deletions for record sets that don't actually exist
    valid_record_set_deletions = [deletion for deletion in record_set_deletions if deletion['ResourceRecordSet']['Name'] in all_record_set_names]
    print('Generated {} record set changes'.format(len(record_set_deletions)))
    if (len(valid_record_set_deletions) > 0):
      route53.change_resource_record_sets(
          HostedZoneId=hosted_zone_id,
          ChangeBatch={
              'Comment': 'Deleting subdomains for ' + stage + ' to ' + domain,
              'Changes': valid_record_set_deletions
          }
      )
      print('Submitted {} deletions to hosted zone'.format(len(record_set_deletions)))

    # Release elastic ip
    elastic_ip = ec.describe_addresses(PublicIps=[public_ip_address])['Addresses'][0]
    ec.release_address(AllocationId=elastic_ip['AllocationId'])

    # Terminate ec2 instance (taking with it ebs)
    ec.terminate_instances(InstanceIds=[instance['InstanceId']])

    print('Finished deleting deployment')
