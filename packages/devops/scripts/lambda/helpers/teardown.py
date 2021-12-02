import boto3

from helpers.networking import delete_gateway, build_record_set_deletion, get_gateway_elb
from helpers.utilities import get_tag

ec = boto3.client('ec2')
route53 = boto3.client('route53')
rds = boto3.client('rds')

def terminate_instance(instance):
    # Release elastic ip
    public_ip_address = instance['PublicIpAddress']
    elastic_ip = ec.describe_addresses(PublicIps=[public_ip_address])['Addresses'][0]
    ec.release_address(AllocationId=elastic_ip['AllocationId'])

    # Terminate ec2 instance (taking with it ebs)
    ec.terminate_instances(InstanceIds=[instance['InstanceId']])

def teardown_instance(instance):
    # Check it's not protected
    protected = get_tag(instance, 'Protected')
    if protected == 'true':
        raise Exception('The instance ' + get_tag(instance, 'Name') + ' is protected and cannot be deleted')

    # Get tagged details of instance
    deployment_type = get_tag(instance, 'DeploymentType')
    deployment_name = get_tag(instance, 'DeploymentName')

    # Delete DNS subdomains
    subdomains_via_dns = get_tag(instance, 'SubdomainsViaGateway')
    public_dns_url = instance['PublicDnsName']
    record_set_deletions = [build_record_set_deletion('tupaia.org', subdomain, deployment_name, dns_url=public_dns_url) for subdomain in subdomains_via_dns.split(',')]

    # Delete gateway subdomains
    subdomains_via_gateway = get_tag(instance, 'SubdomainsViaGateway')
    if subdomains_via_gateway != '':
      gateway_elb = get_gateway_elb(deployment_type, deployment_name)
      record_set_deletions = record_set_deletions + [build_record_set_deletion('tupaia.org', subdomain, deployment_name, gateway=gateway_elb) for subdomain in subdomains_via_gateway.split(',')]

    # Filter out deletions for record sets that don't actually exist
    hosted_zone_id = route53.list_hosted_zones_by_name(DNSName='tupaia.org')['HostedZones'][0]['Id']
    all_record_sets = route53.list_resource_record_sets(HostedZoneId=hosted_zone_id)['ResourceRecordSets']
    all_record_set_names = [record_set['Name'] for record_set in all_record_sets]
    valid_record_set_deletions = [deletion for deletion in record_set_deletions if deletion['ResourceRecordSet']['Name'] in all_record_set_names]
    print('Generated {} record set changes'.format(len(record_set_deletions)))
    if len(valid_record_set_deletions) > 0:
      route53.change_resource_record_sets(
          HostedZoneId=hosted_zone_id,
          ChangeBatch={
              'Comment': 'Deleting subdomains for ' + deployment_name,
              'Changes': valid_record_set_deletions
          }
      )
      print('Submitted {} deletions to hosted zone'.format(len(record_set_deletions)))

    # Delete gateway
    if subdomains_via_gateway != '':
      delete_gateway(deployment_type, deployment_name)

    terminate_instance(instance)

def teardown_db_instance(
  instance_name
):
    deleted_instance = rds.delete_db_instance(
        DBInstanceIdentifier=instance_name,
        SkipFinalSnapshot=True,
        DeleteAutomatedBackups=True
    )
    print('Successfully deleted db instance')

    return deleted_instance