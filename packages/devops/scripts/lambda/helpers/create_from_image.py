import boto3
from pathlib import Path

from helpers.creation import create_instance
from helpers.utilities import get_account_ids

ec = boto3.client('ec2')

def get_latest_image_id(code):
    filters = [
        {'Name': 'tag:Code', 'Values': [code]},
    ]
    account_ids = get_account_ids()
    image_response = ec.describe_images(Owners=account_ids, Filters=filters)
    if 'Images' not in image_response or len(image_response['Images']) == 0:
        raise Exception('No images matching ' + code)
    image_id = sorted(image_response['Images'], key=lambda k: k['CreationDate'], reverse=True)[0]['ImageId']
    print('Found image with id ' + image_id)
    return image_id

def create_instance_from_image(
    deployment_name,
    instance_name_prefix,
    instance_type,
    branch=None,
    extra_tags=None,
    iam_role_arn=None,
    image_code=None,
    image_id=None,
    security_group_code=None,
    security_group_id=None,
    subdomains_via_dns=None,
    subdomains_via_gateway=None,
    user_data=None,
    volume_size=None
):
    print('Creating ' + deployment_name + ' as ' + instance_type)

    # get ami to create instance from
    if image_code:
        image_id = get_latest_image_id(image_code)
    else:
        image_id = image_id

    instance_object = create_instance(
        deployment_name,
        instance_name_prefix,
        instance_type,
        branch=branch,
        extra_tags=extra_tags,
        iam_role_arn=iam_role_arn,
        image_id=image_id,
        security_group_code=security_group_code,
        security_group_id=security_group_id,
        subdomains_via_dns=subdomains_via_dns,
        subdomains_via_gateway=subdomains_via_gateway,
        user_data=user_data,
        volume_size=volume_size,
    )

    return instance_object

def create_tupaia_instance_from_image(
    deployment_name,
    branch,
    instance_type,
    extra_tags=None,
    image_code=None,
    image_id=None,
    security_group_code=None,
    security_group_id=None,
    setup_gateway=True,
):
    instance_name_prefix = 'tupaia: '
    tupaia_server_iam_role_arn = 'arn:aws:iam::843218180240:instance-profile/TupaiaServerRole'
    tupaia_subdomains = ['','admin','admin-api','api','config','export','mobile','psss','report-api','psss-api','entity-api','lesmis-api','lesmis'] if setup_gateway else None
    tupaia_volume_size = 20 # 20GB
    startup_script = Path('./resources/startup.sh').read_text()

    return create_instance_from_image(
        deployment_name,
        instance_name_prefix,
        instance_type,
        branch=branch,
        extra_tags=extra_tags,
        iam_role_arn=tupaia_server_iam_role_arn,
        image_code=image_code,
        image_id=image_id,
        security_group_code=security_group_code,
        security_group_id=security_group_id,
        subdomains_via_gateway=tupaia_subdomains,
        user_data=startup_script,
        volume_size=tupaia_volume_size,
    )
