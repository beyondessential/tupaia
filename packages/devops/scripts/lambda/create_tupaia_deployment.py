import boto3
import re
import asyncio
from pathlib import Path
from utilities.utilities import *
from utilities.clone import *
from utilities.create_from_image import *

ec2 = boto3.resource('ec2')
ec = boto3.client('ec2')
iam = boto3.client('iam')
route53 = boto3.client('route53')
loop = asyncio.get_event_loop()
tupaia_server_iam_role_arn = 'arn:aws:iam::843218180240:instance-profile/TupaiaServerRole'
tupaia_subdomains = ['','admin','admin-api','api','config','export','mobile','psss','report-api','psss-api','entity-api','lesmis-api','lesmis']

def add_subdomains_to_route53(domain, subdomains, stage, gateway=None, dns_url=None):
    print('Creating subdomains')
    record_set_changes = [build_record_set_change(domain, subdomain, stage, gateway=gateway, dns_url=dns_url) for subdomain in subdomains]
    print('Generated {} record set changes'.format(len(record_set_changes)))
    hosted_zone_id = route53.list_hosted_zones_by_name(DNSName=domain)['HostedZones'][0]['Id']
    route53.change_resource_record_sets(
        HostedZoneId=hosted_zone_id,
        ChangeBatch={
            'Comment': 'Adding subdomains for ' + stage + ' to ' + domain,
            'Changes': record_set_changes
        }
    )
    print('Submitted changes to hosted zone')


def setup_tupaia_subdomains(instance_id, stage):
    # Fetch *.tupaia.org certificate
    ssl_certificate = get_cert('TupaiaWildcard')

    # Create a gateway for the server instance
    print('Creating gateway')
    gateway_elb = create_gateway(
        tupaia_instance_name=stage,
        tupaia_instance_id=instance_id,
        ssl_certificate_arn=ssl_certificate['CertificateArn']
    )

    add_subdomains_to_route53('tupaia.org', tupaia_subdomains, stage, gateway=gateway_elb)

def create_gateway(tupaia_instance_name, tupaia_instance_id, ssl_certificate_arn):
    # 1. Create ELB
    prod_gateway_elb = get_gateway_elb('production')
    new_gateway_elb = create_gateway_elb(
        tupaia_instance_name=tupaia_instance_name,
        tupaia_instance_id=tupaia_instance_id,
        config=prod_gateway_elb,
    )
    new_gateway_elb_arn = new_gateway_elb['LoadBalancerArn']

    # 2. Create Target Group
    prod_gateway_target_group = get_gateway_target_group('production')
    new_gateway_target_group_arn = create_gateway_target_group(
        tupaia_instance_name=tupaia_instance_name,
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


def lambda_handler(event, context):
    # validate input config
    if 'Branch' not in event:
        raise Exception('You must include the key "Branch" in the lambda config, e.g. "dev".')
    branch = event['Branch']

    if 'DeploymentCode' not in event:
        raise Exception('You must include the key "DeploymentCode" in the lambda config to indicate which database snapshot to use.')
    deployment_code = event['DeploymentCode']

    if 'InstanceType' not in event:
        raise Exception('You must include the key "InstanceType" in the lambda config. We recommend "t3a.medium" unless you need more speed.')
    instance_type = event['InstanceType']

    # set up aws account to execute under
    account_ids = list()
    try:
        account_ids.append(iam.get_user()['User']['Arn'].split(':')[4])
    except Exception as e:
        # use the exception message to get the account ID the function executes under
        account_ids.append(re.search(r'(arn:aws:sts::)([0-9]+)', str(e)).groups()[1])

    # launch server instance based on gold master AMI
    startup_script = Path('./resources/startup.sh').read_text()
    server_instance = create_instance_from_image(account_ids, deployment_code, branch, instance_type, iam_role_arn=tupaia_server_iam_role_arn, user_data=startup_script)
    setup_tupaia_subdomains(server_instance['InstanceId'], branch)
    add_subdomains_to_route53('tupaia.org', ['ssh'], branch, dns_url=server_instance['PublicDnsName'])

    # clone db instance
    # do this after the server has started because it will take a while to run its startup script, so
    # we might as well be cloning the db instance at the same time, so long is it is available before
    # the server first tries to connect
    db_instance = clone_instance(account_ids, deployment_code, branch, instance_type)
    add_subdomains_to_route53('tupaia.org', ['db'], branch, dns_url=db_instance['PublicDnsName'])

    print('Successfully deployed branch ' + branch + ' from ' + deployment_code)
