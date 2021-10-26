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

def create_instance_from_image(code, stage, instance_type, iam_role_arn=None, user_data=None, subdomains_via_dns=None, subdomains_via_gateway=None, volume_size=None):
    print('Creating ' + instance_type + ' from image tagged with Code=' + code)

    # get ami to create instance from
    image_id = get_latest_image_id(code)

    instance_object = create_instance(code, instance_type, stage, iam_role_arn=iam_role_arn, image_id=image_id, user_data=user_data, subdomains_via_dns=subdomains_via_dns, subdomains_via_gateway=subdomains_via_gateway, volume_size=volume_size)

    return instance_object

def create_tupaia_instance_from_image(server_deployment_code, branch, instance_type, setup_gateway=True):
    tupaia_server_iam_role_arn = 'arn:aws:iam::843218180240:instance-profile/TupaiaServerRole'
    tupaia_subdomains = ['','admin','admin-api','api','config','export','mobile','psss','report-api','psss-api','entity-api','lesmis-api','lesmis'] if setup_gateway else None
    tupaia_volume_size = 20 # 20GB
    startup_script = Path('./resources/startup.sh').read_text()

    create_instance_from_image(server_deployment_code, branch, instance_type, iam_role_arn=tupaia_server_iam_role_arn, user_data=startup_script, subdomains_via_dns=['ssh'], subdomains_via_gateway=tupaia_subdomains, volume_size=tupaia_volume_size)
