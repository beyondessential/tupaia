import boto3
import asyncio
import functools

ec2 = boto3.resource('ec2')
ec = boto3.client('ec2')
elbv2 = boto3.client('elbv2')
acm = boto3.client('acm')

loop = asyncio.get_event_loop()


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

# --------------
# EC2
# --------------

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

def allocate_elastic_ip(instance_id):
    elastic_ip = ec.allocate_address(Domain='Vpc')
    ec.associate_address(AllocationId=elastic_ip['AllocationId'],InstanceId=instance_id)
    return elastic_ip['PublicIp']

def get_instance_creation_config(code, instance_type, stage, iam_role_arn=None, image_id=None, user_data=None, base_instance=None):
    # Get the security group tagged with the key matching this restore code
    security_group_filters = [
      {'Name': 'tag-key', 'Values': [code]}
    ]
    security_groups = ec.describe_security_groups(
      Filters=security_group_filters
    ).get(
      'SecurityGroups', []
    )
    security_group_ids = [security_group['GroupId'] for security_group in security_groups]
    print('Found security group ids')

    tags = [
        { 'Key': 'Name', 'Value': code + ': ' + stage },
        { 'Key': 'Stage', 'Value': stage },
        { 'Key': 'Code', 'Value': code },
        { 'Key': 'StopAtUTC', 'Value': '09:00'}, # 9am UTC is 7pm AEST, 8pm AEDT, 9pm NZST, 10pm NZDT
        { 'Key': 'StartAtUTC', 'Value': '18:00'} # 6pm UTC is 4am AEST, 5am AEDT, 6am NZST, 7am NZDT
    ]

    # attach restoration config tags
    if base_instance is not None:
        restore_code = get_tag(base_instance, 'RestoreCode')
        if restore_code is not '':
            base_instance_stage = get_tag(base_instance, 'Stage')
            if base_instance_stage == stage:
                # we are replacing the same stage instance, keep the RestoreCode
                tags.append({ 'Key': 'RestoreCode', 'Value': restore_code })
            else:
                # new branch instance, add a "RestoreFrom"
                tags.append({ 'Key': 'RestoreFrom', 'Value': restore_code })

    instance_creation_config = {
      'ImageId' : image_id or base_instance['ImageId'], #todo fix this
      'InstanceType' : instance_type,
    #   todo reinstate some form of these
    #   'SubnetId' : base_instance['SubnetId'],
    #   'Placement' : base_instance['Placement'],
      'SecurityGroupIds' : security_group_ids,
      'MinCount' : 1,
      'MaxCount' : 1,
      'TagSpecifications' : [{ 'ResourceType': 'instance', 'Tags': tags}]
    }

    # add IAM profile (e.g. role allowing access to lambda) if applicable
    if iam_role_arn is not None:
        instance_creation_config['IamInstanceProfile'] = { 'Arn': iam_role_arn }

    # add user data startup script if applicable
    if user_data is not None:
        instance_creation_config['UserData'] = user_data

    return instance_creation_config

def create_instance(code, instance_type, stage, iam_role_arn=None, image_id=None, user_data=None, base_instance=None):
    instance_creation_config = get_instance_creation_config(code, instance_type, stage, iam_role_arn=iam_role_arn, image_id=image_id, user_data=user_data, base_instance=base_instance)
    new_instances = ec2.create_instances(**instance_creation_config)
    print('Started new instance creation')

    # wait until it is ready
    new_instance = new_instances[0]
    new_instance.wait_until_running()
    print('New instance is up')

    # attach elastic ip
    allocate_elastic_ip(new_instance.id)

    # return instance object
    new_instance_object = get_instances([
      {'Name': 'instance-id', 'Values': [new_instance.id]}
    ])[0]
    return new_instance_object

# --------------
# Gateway
# --------------

def get_gateway_elb(tupaia_instance_name):
    elbs = elbv2.describe_load_balancers(PageSize=400)
    for elb in elbs['LoadBalancers']:
        tag_descriptions = elbv2.describe_tags(
            ResourceArns=[elb['LoadBalancerArn']]
        )
        matching_arns = list(filter(lambda x: tags_contains(x['Tags'], 'Type', 'Tupaia-Gateway') and tags_contains(x['Tags'], 'TupaiaInstanceName', tupaia_instance_name), tag_descriptions['TagDescriptions']))
        if len(matching_arns) > 1:
            raise Exception('Multiple gateway elbs found tagged with tupaia instance name: ' + tupaia_instance_name)
        if len(matching_arns) == 1:
            return elb
    raise Exception('No gateway elb found tagged with tupaia instance name: ' + tupaia_instance_name)


def get_gateway_target_group(tupaia_instance_name):
    target_groups = elbv2.describe_target_groups(PageSize=400)
    for target_group in target_groups['TargetGroups']:
        tag_descriptions = elbv2.describe_tags(
            ResourceArns=[target_group['TargetGroupArn']]
        )
        matching_arns = list(filter(lambda x: tags_contains(x['Tags'], 'Type', 'Tupaia-Gateway') and tags_contains(x['Tags'], 'TupaiaInstanceName', tupaia_instance_name), tag_descriptions['TagDescriptions']))
        if len(matching_arns) > 1:
            raise Exception('Multiple target groups found tagged with tupaia instance name: ' + tupaia_instance_name)
        if len(matching_arns) == 1:
            return target_group

    raise Exception('No gateway target group found tagged with tupaia instance name: ' + tupaia_instance_name)


def get_gateway_listeners(tupaia_instance_name):
    elb = get_gateway_elb(tupaia_instance_name)
    return elbv2.describe_listeners(
        LoadBalancerArn=elb['LoadBalancerArn'],
        PageSize=100
    )['Listeners']


def create_gateway_elb(tupaia_instance_name, tupaia_instance_id, config):
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
                'Key': 'TupaiaInstanceName',
                'Value': tupaia_instance_name
            },
        ],
        Type=config['Type'],
        IpAddressType=config['IpAddressType']
    )
    return response['LoadBalancers'][0]


def create_gateway_target_group(tupaia_instance_name, tupaia_instance_id, config):
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
                'Key': 'TupaiaInstanceName',
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


# --------------
# Route 53
# --------------

def build_record_set_change(domain, subdomain, stage, gateway=None, dns_url=None):
    return build_record_set('UPSERT', domain, subdomain, stage, gateway=gateway, dns_url=dns_url)


def build_record_set_deletion(domain, subdomain, stage, gateway=None, dns_url=None):
    return build_record_set('DELETE', domain, subdomain, stage, gateway=gateway, dns_url=dns_url)


def build_record_set(action, domain, subdomain, stage, gateway=None, dns_url=None):
    if (subdomain == ''):
        url = stage + '.' + domain + '.'
    else:
        url = stage + '-' + subdomain + '.' + domain + '.'

    # e.g. db subdomain uses CNAME to AWS DNS so that it can be internally resolved within the VPC
    if (dns_url is not None):
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

    if (gateway is None):
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
