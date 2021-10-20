from helpers.networking import *

def teardown_instance(instance_name):
    filters = [
      { 'Name': 'tag:Name', 'Values': [instance_name] },
    ]
    instance = get_instances(filters)[0]

    if not instance:
      raise Exception('No matching instance found')

    # Check it's not protected
    protected = get_tag(instance, 'Protected')
    if protected == 'true':
        raise Exception('The instance ' + get_tag(instance, 'InstanceName') + ' is protected and cannot be deleted')

    # Get tagged details of instance
    stage = get_tag(instance, 'Stage')
    domain = get_tag(instance, 'DomainName')

    # Delete DNS subdomains
    subdomains_via_dns = get_tag(instance, 'SubdomainsViaGateway')
    public_dns_url = instance['PublicDnsName']
    record_set_deletions = [build_record_set_deletion(domain, subdomain, stage, dns_url=public_dns_url) for subdomain in subdomains_via_dns.split(',')]

    # Delete gateway subdomains
    subdomains_via_gateway = get_tag(instance, 'SubdomainsViaGateway')
    if (subdomains_via_gateway != ''):
      gateway_elb = get_gateway_elb(stage)
      record_set_deletions = record_set_deletions + [build_record_set_deletion(domain, subdomain, stage, gateway=gateway_elb) for subdomain in subdomains_via_gateway.split(',')]

    # Filter out deletions for record sets that don't actually exist
    hosted_zone_id = route53.list_hosted_zones_by_name(DNSName=domain)['HostedZones'][0]['Id']
    all_record_sets = route53.list_resource_record_sets(HostedZoneId=hosted_zone_id)['ResourceRecordSets']
    all_record_set_names = [record_set['Name'] for record_set in all_record_sets]
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
    public_ip_address = instance['PublicIpAddress']
    elastic_ip = ec.describe_addresses(PublicIps=[public_ip_address])['Addresses'][0]
    ec.release_address(AllocationId=elastic_ip['AllocationId'])

    # Delete gateway
    if (subdomains_via_gateway != ''):
      delete_gateway(stage)

    # Terminate ec2 instance (taking with it ebs)
    ec.terminate_instances(InstanceIds=[instance['InstanceId']])
