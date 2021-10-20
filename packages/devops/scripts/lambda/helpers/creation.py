import boto3

from helpers.networking import setup_subdomains_via_dns, setup_subdomains_via_gateway
from helpers.utilities import get_instances, get_tag

ec2 = boto3.resource('ec2')
ec = boto3.client('ec2')

def allocate_elastic_ip(instance_id):
    elastic_ip = ec.allocate_address(Domain='Vpc')
    ec.associate_address(AllocationId=elastic_ip['AllocationId'],InstanceId=instance_id)
    return elastic_ip['PublicIp']

def get_instance_creation_config(code, instance_type, stage, iam_role_arn=None, image_id=None, user_data=None, base_instance=None, subdomains_via_dns=None, subdomains_via_gateway=None):
    # Get the security group tagged with the key matching this code
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

    if (subdomains_via_dns):
        tags.append({ 'Key': 'SubdomainsViaDns', 'Value': ','.join(subdomains_via_dns) })

    if (subdomains_via_gateway):
        tags.append({ 'Key': 'SubdomainsViaGateway', 'Value': ','.join(subdomains_via_gateway) })

    # attach cloning config tags
    if base_instance is not None:
        code = get_tag(base_instance, 'Code')
        if code != '' and get_tag(base_instance, 'Stage') != stage:
            # new branch instance, add a "ClonedFrom"
            tags.append({ 'Key': 'ClonedFrom', 'Value': code })

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

def create_instance(code, instance_type, stage, iam_role_arn=None, image_id=None, user_data=None, base_instance=None, subdomains_via_dns=None, subdomains_via_gateway=None):
    instance_creation_config = get_instance_creation_config(code, instance_type, stage, iam_role_arn=iam_role_arn, image_id=image_id, user_data=user_data, base_instance=base_instance, subdomains_via_dns=subdomains_via_dns, subdomains_via_gateway=subdomains_via_gateway)
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

    if (subdomains_via_dns):
        setup_subdomains_via_dns(new_instance_object, subdomains_via_dns, stage)
    if (subdomains_via_gateway):
        setup_subdomains_via_gateway(new_instance_object, subdomains_via_gateway, stage)

    return new_instance_object
