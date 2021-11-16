import boto3

from helpers.utilities import get_instance_by_id, tags_contains

# --------------
# Certificate manager
# --------------

acm = boto3.client('acm')

def get_cert(type_tag):
    certs = acm.list_certificates(MaxItems=400)
    for cert in certs['CertificateSummaryList']:
        tags = acm.list_tags_for_certificate(CertificateArn=cert['CertificateArn'])
        if tags_contains(tags['Tags'], 'Type', type_tag):
            return cert
    raise Exception('No certificate found with type tag: ' + type_tag)

# --------------
# Gateway
# --------------

elbv2 = boto3.client('elbv2')

def get_gateway_elb(deployment_name):
    elbs = elbv2.describe_load_balancers(PageSize=400)
    for elb in elbs['LoadBalancers']:
        tag_descriptions = elbv2.describe_tags(
            ResourceArns=[elb['LoadBalancerArn']]
        )
        matching_arns = list(filter(lambda x: tags_contains(x['Tags'], 'Type', 'Tupaia-Gateway') and tags_contains(x['Tags'], 'DeploymentName', deployment_name), tag_descriptions['TagDescriptions']))
        if len(matching_arns) > 1:
            raise Exception('Multiple gateway elbs found tagged with tupaia deployment name: ' + deployment_name)
        if len(matching_arns) == 1:
            return elb
    raise Exception('No gateway elb found tagged with tupaia deployment name: ' + deployment_name)


def get_gateway_target_group(deployment_name):
    target_groups = elbv2.describe_target_groups(PageSize=400)
    for target_group in target_groups['TargetGroups']:
        tag_descriptions = elbv2.describe_tags(
            ResourceArns=[target_group['TargetGroupArn']]
        )
        matching_arns = list(filter(lambda x: tags_contains(x['Tags'], 'Type', 'Tupaia-Gateway') and tags_contains(x['Tags'], 'DeploymentName', deployment_name), tag_descriptions['TagDescriptions']))
        if len(matching_arns) > 1:
            raise Exception('Multiple target groups found tagged with tupaia deployment name: ' + deployment_name)
        if len(matching_arns) == 1:
            return target_group

    raise Exception('No gateway target group found tagged with tupaia deployment name: ' + deployment_name)


def get_gateway_listeners(deployment_name):
    elb = get_gateway_elb(deployment_name)
    return elbv2.describe_listeners(
        LoadBalancerArn=elb['LoadBalancerArn'],
        PageSize=100
    )['Listeners']


def create_gateway_elb(deployment_name, tupaia_instance_id, config):
    response = elbv2.create_load_balancer(
        Name='gateway-elb-' + tupaia_instance_id,
        Subnets=list(map(lambda x: x['SubnetId'], config['AvailabilityZones'])),
        SecurityGroups=config['SecurityGroups'],
        Scheme=config['Scheme'],
        Tags=[
            {
                'Key': 'Type',
                'Value': 'Tupaia-Gateway'
            },
            {
                'Key': 'DeploymentName',
                'Value': deployment_name
            },
        ],
        Type=config['Type'],
        IpAddressType=config['IpAddressType']
    )
    return response['LoadBalancers'][0]


def create_gateway_target_group(deployment_name, tupaia_instance_id, config):
    response = elbv2.create_target_group(
        Name='gateway-tg-' + tupaia_instance_id,
        Protocol=config['Protocol'],
        ProtocolVersion=config['ProtocolVersion'],
        Port=config['Port'],
        VpcId=config['VpcId'],
        HealthCheckProtocol=config['HealthCheckProtocol'],
        HealthCheckPort=config['HealthCheckPort'],
        HealthCheckEnabled=config['HealthCheckEnabled'],
        HealthCheckPath=config['HealthCheckPath'],
        HealthCheckIntervalSeconds=config['HealthCheckIntervalSeconds'],
        HealthCheckTimeoutSeconds=config['HealthCheckTimeoutSeconds'],
        HealthyThresholdCount=config['HealthyThresholdCount'],
        UnhealthyThresholdCount=config['UnhealthyThresholdCount'],
        Matcher=config['Matcher'],
        TargetType=config['TargetType'],
        Tags=[
            {
                'Key': 'Type',
                'Value': 'Tupaia-Gateway'
            },
            {
                'Key': 'DeploymentName',
                'Value': deployment_name
            },
        ]
    )
    return response['TargetGroups'][0]['TargetGroupArn']


def create_gateway_listeners(elb_arn, target_group_arn, certificate_arn):
    # HTTP
    elbv2.create_listener(
        LoadBalancerArn=elb_arn,
        Protocol='HTTP',
        Port=80,
        DefaultActions=[
            {
                'Type': 'forward',
                'ForwardConfig': {
                    'TargetGroups': [
                        {
                            'TargetGroupArn': target_group_arn
                        }
                    ]
                }
            },
        ]
    )
    # HTTPS
    elbv2.create_listener(
        LoadBalancerArn=elb_arn,
        Protocol='HTTPS',
        Port=443,
        SslPolicy='ELBSecurityPolicy-2016-08',  # default
        Certificates=[
            {
                'CertificateArn': certificate_arn
            },
        ],
        DefaultActions=[
            {
                'Type': 'forward',
                'ForwardConfig': {
                    'TargetGroups': [
                        {
                            'TargetGroupArn': target_group_arn
                        }
                    ]
                }
            },
        ]
    )


def register_gateway_target(target_group_arn, tupaia_instance_id):
    elbv2.register_targets(
        TargetGroupArn=target_group_arn,
        Targets=[
            {
                'Id': tupaia_instance_id,
                'Port': 80
            },
        ]
    )

def deregister_gateway_target(target_group_arn, tupaia_instance_id):
    elbv2.deregister_targets(
        TargetGroupArn=target_group_arn,
        Targets=[
            {
                'Id': tupaia_instance_id,
                'Port': 80
            },
        ]
    )


# --------------
# Route 53
# --------------

route53 = boto3.client('route53')

def build_record_set_change(domain, subdomain, deployment_name, gateway=None, dns_url=None):
    return build_record_set('UPSERT', domain, subdomain, deployment_name, gateway=gateway, dns_url=dns_url)


def build_record_set_deletion(domain, subdomain, deployment_name, gateway=None, dns_url=None):
    return build_record_set('DELETE', domain, subdomain, deployment_name, gateway=gateway, dns_url=dns_url)


def build_record_set(action, domain, subdomain, deployment_name, gateway=None, dns_url=None):
    if subdomain == '':
        url = deployment_name + '.' + domain + '.'
    else:
        url = deployment_name + '-' + subdomain + '.' + domain + '.'

    # e.g. db subdomain uses CNAME to AWS DNS so that it can be internally resolved within the VPC
    if dns_url:
        return {
            'Action': action,
            'ResourceRecordSet': {
                'Name': url,
                'Type': 'CNAME',
                'TTL': 300,
                'ResourceRecords': [
                    {'Value': dns_url}
                ]
            }
        }

    if gateway is None:
        raise Exception('You must include a dns url, or gateway to configure route53.')

    # prefix with dualstack, see
    # https://aws.amazon.com/premiumsupport/knowledge-center/alias-resource-record-set-route53-cli/
    dns_name = 'dualstack.' + gateway['DNSName']

    return {
        'Action': action,
        'ResourceRecordSet': {
            'Name': url,
            'Type': 'A',
            'AliasTarget': {
                'HostedZoneId': gateway['CanonicalHostedZoneId'],
                'DNSName': dns_name,
                'EvaluateTargetHealth': False
            }
        }
    }

def add_subdomains_to_route53(domain, subdomains, deployment_name, gateway=None, dns_url=None):
    print('Creating subdomains')
    record_set_changes = [build_record_set_change(domain, subdomain, deployment_name, gateway=gateway, dns_url=dns_url) for subdomain in subdomains]
    print('Generated {} record set changes'.format(len(record_set_changes)))
    hosted_zone_id = route53.list_hosted_zones_by_name(DNSName=domain)['HostedZones'][0]['Id']
    route53.change_resource_record_sets(
        HostedZoneId=hosted_zone_id,
        ChangeBatch={
            'Comment': 'Adding subdomains for ' + deployment_name + ' to ' + domain,
            'Changes': record_set_changes
        }
    )
    print('Submitted changes to hosted zone')



def get_instance_behind_gateway(deployment_name):
    gateway_target_group = get_gateway_target_group(deployment_name)

    targets = elbv2.describe_target_health(TargetGroupArn=gateway_target_group['TargetGroupArn'])['TargetHealthDescriptions']

    if not targets or len(targets) == 0:
        raise Exception('Could not find any targets behind the gateway for ' + deployment_name)

    if len(targets) > 1:
        raise Exception('Too many targets for ' + deployment_name)

    instance_id = targets[0]['Target']['Id']

    return get_instance_by_id(instance_id)


# --------------
# Putting it all together
# --------------

def create_tupaia_gateway(deployment_name, tupaia_instance_id, ssl_certificate_arn):
    # 1. Create ELB
    prod_gateway_elb = get_gateway_elb('production')
    new_gateway_elb = create_gateway_elb(
        deployment_name=deployment_name,
        tupaia_instance_id=tupaia_instance_id,
        config=prod_gateway_elb,
    )
    new_gateway_elb_arn = new_gateway_elb['LoadBalancerArn']

    # 2. Create Target Group
    prod_gateway_target_group = get_gateway_target_group('production')
    new_gateway_target_group_arn = create_gateway_target_group(
        deployment_name=deployment_name,
        tupaia_instance_id=tupaia_instance_id,
        config=prod_gateway_target_group,
    )

    # 3. Link target group <-> instance
    register_gateway_target(
        target_group_arn=new_gateway_target_group_arn,
        tupaia_instance_id=tupaia_instance_id
    )

    # 4. Link ELB <-> target group
    create_gateway_listeners(
        elb_arn=new_gateway_elb_arn,
        target_group_arn=new_gateway_target_group_arn,
        certificate_arn=ssl_certificate_arn
    )

    return new_gateway_elb

def delete_gateway(deployment_name):
    gateway_elb = get_gateway_elb(deployment_name)

    # (order matters)
    # 1. Delete listeners
    listeners = get_gateway_listeners(deployment_name)
    for listener in listeners:
        elbv2.delete_listener(
            ListenerArn=listener['ListenerArn']
        )

    # 2. Delete ELB
    elbv2.delete_load_balancer(
        LoadBalancerArn=gateway_elb['LoadBalancerArn']
    )

    # 3. Delete Target Group
    gateway_target_group = get_gateway_target_group(deployment_name)
    elbv2.delete_target_group(
        TargetGroupArn=gateway_target_group['TargetGroupArn']
    )

def swap_gateway_instance(deployment_name, old_instance_id, new_instance_id):
    gateway_target_group = get_gateway_target_group(deployment_name)

    register_gateway_target(
        target_group_arn=gateway_target_group['TargetGroupArn'],
        tupaia_instance_id=new_instance_id
    )

    deregister_gateway_target(
        target_group_arn=gateway_target_group['TargetGroupArn'],
        tupaia_instance_id=old_instance_id
    )


def setup_subdomains_via_gateway(instance_object, subdomains, deployment_name):
    # Fetch *.tupaia.org certificate
    ssl_certificate = get_cert('TupaiaWildcard')

    # Create a gateway for the server instance
    print('Creating gateway')
    gateway_elb = create_tupaia_gateway(
        deployment_name=deployment_name,
        tupaia_instance_id=instance_object['InstanceId'],
        ssl_certificate_arn=ssl_certificate['CertificateArn']
    )

    add_subdomains_to_route53('tupaia.org', subdomains, deployment_name, gateway=gateway_elb)

def setup_subdomains_via_dns(instance_object, subdomains, deployment_name):
    add_subdomains_to_route53('tupaia.org', subdomains, deployment_name, dns_url=instance_object['PublicDnsName'])


