import boto3
import asyncio

from utilities.utilities import *

ec = boto3.client('ec2')

loop = asyncio.get_event_loop()

def get_latest_image_id(account_ids, code):
    filters = [
        {'Name': 'tag:Code', 'Values': [code]},
    ]
    image_response = ec.describe_images(Owners=account_ids, Filters=filters)
    if 'Images' not in image_response or len(image_response['Images']) == 0:
        raise Exception('No images matching ' + code)
    image_id = sorted(image_response['Images'], key=lambda k: k['CreationDate'], reverse=True)[0]['ImageId']
    print('Found image with id ' + image_id)
    return image_id

def create_instance_from_image(account_ids, code, stage, instance_type, iam_role_arn=None, user_data=None):
    print('Creating ' + instance_type + ' from image tagged with Code=' + code)

    # get ami to create instance from
    image_id = get_latest_image_id(account_ids, code)

    instance_object = create_instance(code, instance_type, stage, iam_role_arn=iam_role_arn, image_id=image_id, user_data=user_data)

    return instance_object
