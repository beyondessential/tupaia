import boto3

from helpers.networking import add_subdomains_to_route53, setup_subdomains_via_dns, setup_subdomains_via_gateway
from helpers.utilities import get_instance_by_id
from helpers.rds import get_latest_db_snapshot

ec2 = boto3.resource('ec2')
ec = boto3.client('ec2')
rds = boto3.client('rds')

def allocate_elastic_ip(instance_id):
    elastic_ip = ec.allocate_address(Domain='Vpc')
    ec.associate_address(AllocationId=elastic_ip['AllocationId'],InstanceId=instance_id)
    return elastic_ip['PublicIp']

def get_security_group_ids_config(
  security_group_code=None,
  security_group_id=None,
):
    if security_group_code:
        # Get the security group tagged with the key matching this code
        security_group_filters = [
          {'Name': 'tag:Code', 'Values': [security_group_code]}
        ]
        security_groups = ec.describe_security_groups(
          Filters=security_group_filters
        ).get(
          'SecurityGroups', []
        )
        security_group_ids = [security_group['GroupId'] for security_group in security_groups]
        print('Found security group ids')
    else:
        security_group_ids = [security_group_id]

    return security_group_ids

def get_instance_creation_config(
  deployment_name,
  deployment_type,
  instance_type,
  branch=None,
  cloned_from=None,
  extra_tags=None,
  iam_role_arn=None,
  image_id=None,
  security_group_code=None,
  security_group_id=None,
  subdomains_via_dns=None,
  subdomains_via_gateway=None,
  user_data=None,
  volume_size=None,
):
    security_group_ids = get_security_group_ids_config(security_group_code, security_group_id)

    instance_name = deployment_type + ': ' + deployment_name

    tags = [
      { 'Key': 'Name', 'Value': instance_name },
      { 'Key': 'DeploymentName', 'Value': deployment_name },
      { 'Key': 'DeploymentType', 'Value': deployment_type },
    ]

    if branch:
      tags.append({ 'Key': 'Branch', 'Value': branch })

    if subdomains_via_dns:
      tags.append({ 'Key': 'SubdomainsViaDns', 'Value': ','.join(subdomains_via_dns) })

    if subdomains_via_gateway:
      tags.append({ 'Key': 'SubdomainsViaGateway', 'Value': ','.join(subdomains_via_gateway) })

    # attach cloning config tags
    if cloned_from:
      tags.append({ 'Key': 'ClonedFrom', 'Value': cloned_from })

    if extra_tags:
      tags = tags + extra_tags

    instance_creation_config = {
      'ImageId' : image_id,
      'InstanceType' : instance_type,
      'SecurityGroupIds' : security_group_ids,
      'MinCount' : 1,
      'MaxCount' : 1,
      'TagSpecifications' : [{ 'ResourceType': 'instance', 'Tags': tags}]
    }

    # add IAM profile (e.g. role allowing access to lambda) if applicable
    if iam_role_arn:
        instance_creation_config['IamInstanceProfile'] = { 'Arn': iam_role_arn }

    # add user data startup script if applicable
    if user_data:
        instance_creation_config['UserData'] = user_data

    if volume_size:
        instance_creation_config['BlockDeviceMappings'] = [
          {
            'DeviceName': '/dev/sda1',
            'Ebs': {
              'VolumeSize': volume_size
              }
          }
        ]

    return instance_creation_config

def create_instance(
  deployment_name,
  deployment_type,
  instance_type,
  branch=None,
  cloned_from=None,
  extra_tags=None,
  iam_role_arn=None,
  image_id=None,
  security_group_code=None,
  security_group_id=None,
  subdomains_via_dns=None,
  subdomains_via_gateway=None,
  user_data=None,
  volume_size=None,
):
    instance_creation_config = get_instance_creation_config(
      deployment_name,
      deployment_type,
      instance_type,
      branch=branch,
      extra_tags=extra_tags,
      cloned_from=cloned_from,
      iam_role_arn=iam_role_arn,
      image_id=image_id,
      security_group_code=security_group_code,
      security_group_id=security_group_id,
      subdomains_via_dns=subdomains_via_dns,
      subdomains_via_gateway=subdomains_via_gateway,
      user_data=user_data,
      volume_size=volume_size,
    )
    new_instances = ec2.create_instances(**instance_creation_config)
    print('Started new instance creation')

    # wait until it is ready
    new_instance = new_instances[0]
    new_instance.wait_until_running()
    print('New instance is up')

    # attach elastic ip
    allocate_elastic_ip(new_instance.id)

    # return instance object
    new_instance_object = get_instance_by_id(new_instance.id)

    if subdomains_via_dns:
        setup_subdomains_via_dns(new_instance_object, subdomains_via_dns, deployment_name)
    if subdomains_via_gateway:
        setup_subdomains_via_gateway(deployment_type, new_instance_object, subdomains_via_gateway, deployment_name)

    return new_instance_object

def create_db_instance_from_snapshot(
  deployment_name,
  deployment_type,
  snapshot_name,
  instance_type,
  security_group_code=None,
  security_group_id=None,
):
    db_instance_id = deployment_type + '-' + deployment_name
    security_group_ids = get_security_group_ids_config(security_group_code, security_group_id)

    snapshot_id = get_latest_db_snapshot(snapshot_name)
    print('Starting to clone db instance from snapshot')
    rds.restore_db_instance_from_db_snapshot(
        DBInstanceIdentifier=db_instance_id,
        DBSnapshotIdentifier=snapshot_id,
        DBInstanceClass=instance_type,
        Port=5432,
        PubliclyAccessible=True,
        VpcSecurityGroupIds=security_group_ids,
        Tags=[
            {
                'Key': 'DeploymentName',
                'Value': deployment_name
            },
            {
                'Key': 'DeploymentType',
                'Value': deployment_type
            },
            {
                'Key': 'ClonedFrom',
                'Value': snapshot_name
            },
        ],
    )
    
    print('Successfully cloned new db instance from snapshot')
    waiter = rds.get_waiter('db_instance_available')
    waiter.wait(DBInstanceIdentifier=db_instance_id)
    instance = rds.describe_db_instances(DBInstanceIdentifier=db_instance_id)['DBInstances'][0]

    add_subdomains_to_route53(
        domain='tupaia.org', 
        subdomains=['db'], 
        deployment_name=deployment_name, 
        dns_url=instance['Endpoint']['Address']
    )

    return instance
