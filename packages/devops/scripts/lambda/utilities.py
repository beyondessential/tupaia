import boto3
import string
import random

ec2 = boto3.resource('ec2')
ec = boto3.client('ec2')
elbv2 = boto3.client('elbv2')
acm = boto3.client('acm')


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


def random_string(length):
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(length))


def tags_contains(tags, key, value):
    tags_matching_key = list(filter(lambda x: x['Key'] == key, tags))
    if len(tags_matching_key) == 0:
        return False
    tag_matching_key = tags_matching_key[0]
    return tag_matching_key['Value'] == value


def get_cert(type_tag):
    certs = acm.list_certificates(MaxItems=400)
    for cert in certs['CertificateSummaryList']:
        tags = acm.list_tags_for_certificate(CertificateArn=cert['CertificateArn'])
        if tags_contains(tags['Tags'], 'Type', type_tag):
            return cert
    raise Exception('No certificate found with type tag: ' + type_tag)


def get_gateway_elb(tupaia_instance_name):
    elbs = elbv2.describe_load_balancers(PageSize=400)
    tags_by_elb = elbv2.describe_tags(
        ResourceArns=list(map(lambda x: x['LoadBalancerArn'], elbs['LoadBalancers']))
    )
    matching_arns = list(filter(lambda x: tags_contains(x['Tags'], 'Type', 'Tupaia-Gateway') and tags_contains(x['Tags'], 'TupaiaInstanceName', tupaia_instance_name), tags_by_elb['TagDescriptions']))
    if len(matching_arns) == 0:
        raise Exception('No gateway elb found tagged with tupaia instance name: ' + tupaia_instance_name)
    matching_arn = matching_arns[0]['ResourceArn']
    return list(filter(lambda x: x['LoadBalancerArn'] == matching_arn, elbs['LoadBalancers']))[0]


def get_gateway_target_group(tupaia_instance_name):
    target_groups = elbv2.describe_target_groups(PageSize=400)
    tags_by_target_group = elbv2.describe_tags(
        ResourceArns=list(map(lambda x: x['TargetGroupArn'], target_groups['TargetGroups']))
    )
    matching_arns = list(filter(lambda x: tags_contains(x['Tags'], 'Type', 'Tupaia-Gateway') and tags_contains(x['Tags'], 'TupaiaInstanceName', tupaia_instance_name), tags_by_target_group['TagDescriptions']))
    if len(matching_arns) == 0:
        raise Exception('No gateway target group found tagged with tupaia instance name: ' + tupaia_instance_name)
    matching_arn = matching_arns[0]['ResourceArn']
    return list(filter(lambda x: x['TargetGroupArn'] == matching_arn, target_groups['TargetGroups']))[0]


def create_gateway_elb(tupaia_instance_name, config, gateway_name):
    response = elbv2.create_load_balancer(
        Name=gateway_name,
        Subnets=list(map(lambda x: x['SubnetId'], config['AvailabilityZones'])),
        SecurityGroups=config['SecurityGroups'],
        Scheme=config['Scheme'],
        Tags=[
            {
                'Key': 'Type',
                'Value': 'Tupaia-Gateway'
            },
            {
                'Key': 'TupaiaInstanceName',
                'Value': tupaia_instance_name
            },
        ],
        Type=config['Type'],
        IpAddressType=config['IpAddressType']
    )
    return response['LoadBalancers'][0]


def create_gateway_target_group(tupaia_instance_name, config, target_group_name):
    response = elbv2.create_target_group(
        Name=target_group_name,
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
                'Key': 'tupaia_instance_name',
                'Value': tupaia_instance_name
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


def build_record_set_change(domain, subdomain, stage, gateway):
    return build_record_set('UPSERT', domain, subdomain, stage, gateway)


def build_record_set_deletion(domain, subdomain, stage, gateway):
    return build_record_set('DELETE', domain, subdomain, stage, gateway)


def build_record_set(action, domain, subdomain, stage, gateway):
    if (subdomain == ''):
        url = stage + '.' + domain + '.'
    else:
        url = stage + '-' + subdomain + '.' + domain + '.'

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