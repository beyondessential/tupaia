import boto3
from pathlib import Path

from helpers.creation import create_instance

ec = boto3.client("ec2")


def create_instance_from_image(
    deployment_name,
    deployment_type,
    instance_type,
    image_code,
    branch=None,
    extra_tags=None,
    iam_role_arn=None,
    security_group_code=None,
    security_group_id=None,
    subdomains_via_dns=None,
    subdomains_via_gateway=None,
    user_data=None,
    volume_size=None,
):
    print("Creating " + deployment_name + " as " + instance_type)

    instance_object = create_instance(
        deployment_name,
        deployment_type,
        instance_type,
        branch=branch,
        extra_tags=extra_tags,
        iam_role_arn=iam_role_arn,
        image_code=image_code,
        security_group_code=security_group_code,
        security_group_id=security_group_id,
        subdomains_via_dns=subdomains_via_dns,
        subdomains_via_gateway=subdomains_via_gateway,
        user_data=user_data,
        volume_size=volume_size,
    )

    return instance_object


def create_server_instance_from_image(
    deployment_name,
    branch,
    instance_type,
    image_code,
    deployment_type="tupaia",
    startup_script=Path("./resources/startupTupaia.sh").read_text(),
    volume_size=20,  # 20GB
    extra_tags=None,
    security_group_code=None,
    security_group_id=None,
    setup_gateway=True,
    setup_dns=False,
):
    tupaia_server_iam_role_arn = (
        "arn:aws:iam::843218180240:instance-profile/TupaiaServerRole"
    )
    tupaia_subdomains = [
        "",
        "admin",
        "admin-api",
        "api",
        "config",
        "psss",
        "report-api",
        "psss-api",
        "entity-api",
        "lesmis-api",
        "lesmis",
        "meditrak-api",
        "data-table-api",
        "tupaia-web-api",
        "tupaia-web",
        "datatrak-web-api",
        "datatrak",
    ]

    return create_instance_from_image(
        deployment_name,
        deployment_type,
        instance_type,
        image_code,
        branch=branch,
        extra_tags=extra_tags,
        iam_role_arn=tupaia_server_iam_role_arn,
        security_group_code=security_group_code,
        security_group_id=security_group_id,
        subdomains_via_gateway=tupaia_subdomains if setup_gateway == True else None,
        subdomains_via_dns=tupaia_subdomains if setup_dns == True else None,
        user_data=startup_script,
        volume_size=volume_size,
    )
