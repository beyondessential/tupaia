import boto3
from helpers.networking import (
    add_subdomains_to_route53,
    setup_subdomains_via_dns,
    setup_subdomains_via_gateway,
)
from helpers.rds import get_latest_db_snapshot, wait_for_db_instance
from helpers.utilities import get_account_ids, get_instance_by_id

ec2 = boto3.resource("ec2")
ec = boto3.client("ec2")
rds = boto3.client("rds")


def get_latest_image_id(image_code):
    filters = [
        {"Name": "tag:Code", "Values": [image_code]},
    ]
    account_ids = get_account_ids()
    image_response = ec.describe_images(Owners=account_ids, Filters=filters)
    if "Images" not in image_response or len(image_response["Images"]) == 0:
        raise Exception("No images matching " + image_code)
    image_id = sorted(
        image_response["Images"], key=lambda k: k["CreationDate"], reverse=True
    )[0]["ImageId"]
    print("Found image with id " + image_id)
    return image_id


def allocate_elastic_ip(instance_id):
    elastic_ip = ec.allocate_address(Domain="Vpc")
    ec.associate_address(
        AllocationId=elastic_ip["AllocationId"], InstanceId=instance_id
    )
    return elastic_ip["PublicIp"]


def get_security_group_ids_config(
    security_group_code=None,
    security_group_id=None,
):
    if security_group_code:
        # Get the security group tagged with the key matching this code
        security_group_filters = [{"Name": "tag:Code", "Values": [security_group_code]}]
        security_groups = ec.describe_security_groups(
            Filters=security_group_filters
        ).get("SecurityGroups", [])
        security_group_ids = [
            security_group["GroupId"] for security_group in security_groups
        ]
        print("Found security group ids")
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
    image_code=None,
    image_id=None,
    security_group_code=None,
    security_group_id=None,
    subdomains_via_dns=None,
    subdomains_via_gateway=None,
    user_data=None,
    volume_size=None,
):
    security_group_ids = get_security_group_ids_config(
        security_group_code, security_group_id
    )

    instance_name = deployment_type + ": " + deployment_name

    image_id = image_id if image_id != None else get_latest_image_id(image_code)

    tags = [
        {"Key": "Name", "Value": instance_name},
        {"Key": "DeploymentName", "Value": deployment_name},
        {"Key": "DeploymentType", "Value": deployment_type},
    ]

    if branch:
        tags.append({"Key": "Branch", "Value": branch})

    if subdomains_via_dns:
        tags.append({"Key": "SubdomainsViaDns", "Value": ",".join(subdomains_via_dns)})

    if subdomains_via_gateway:
        tags.append(
            {"Key": "SubdomainsViaGateway", "Value": ",".join(subdomains_via_gateway)}
        )

    if image_code:
        tags.append({"Key": "ImageCode", "Value": image_code})

    # attach cloning config tags
    if cloned_from:
        tags.append({"Key": "ClonedFrom", "Value": cloned_from})

    if extra_tags:
        tags = tags + extra_tags

    instance_creation_config = {
        "ImageId": image_id,
        "InstanceType": instance_type,
        "SecurityGroupIds": security_group_ids,
        "MinCount": 1,
        "MaxCount": 1,
        "TagSpecifications": [{"ResourceType": "instance", "Tags": tags}],
    }

    # add IAM profile (e.g. role allowing access to lambda) if applicable
    if iam_role_arn:
        instance_creation_config["IamInstanceProfile"] = {"Arn": iam_role_arn}

    # add user data startup script if applicable
    if user_data:
        instance_creation_config["UserData"] = user_data

    if volume_size:
        instance_creation_config["BlockDeviceMappings"] = [
            {"DeviceName": "/dev/sda1", "Ebs": {"VolumeSize": volume_size}}
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
    image_code=None,
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
        image_code=image_code,
        image_id=image_id,
        security_group_code=security_group_code,
        security_group_id=security_group_id,
        subdomains_via_dns=subdomains_via_dns,
        subdomains_via_gateway=subdomains_via_gateway,
        user_data=user_data,
        volume_size=volume_size,
    )
    new_instances = ec2.create_instances(**instance_creation_config)
    print("Started new instance creation")

    # wait until it is ready
    new_instance = new_instances[0]
    new_instance.wait_until_running()
    print("New instance is up")

    # attach elastic ip
    allocate_elastic_ip(new_instance.id)

    # return instance object
    new_instance_object = get_instance_by_id(new_instance.id)

    if subdomains_via_dns:
        setup_subdomains_via_dns(
            new_instance_object, subdomains_via_dns, deployment_name
        )
    if subdomains_via_gateway:
        setup_subdomains_via_gateway(
            deployment_type,
            new_instance_object,
            subdomains_via_gateway,
            deployment_name,
        )

    return new_instance_object


def clone_db_from_snapshot(
    deployment_name,
    deployment_type,
    snapshot_name,
    instance_type,
    extra_tags=[],
    security_group_code=None,
    security_group_id=None,
):
    db_instance_id = deployment_type + "-" + deployment_name
    snapshot_db_instance_id = deployment_type + "-" + snapshot_name
    security_group_ids = get_security_group_ids_config(
        security_group_code, security_group_id
    )
    required_tags = [
        {"Key": "DeploymentName", "Value": deployment_name},
        {"Key": "DeploymentType", "Value": deployment_type},
        {"Key": "ClonedFrom", "Value": snapshot_name},
    ]

    required_tags_keys = list(
        map(lambda required_tag: required_tag["Key"], required_tags)
    )
    non_repeating_extra_tags = list(
        filter(lambda item: item["Key"] not in required_tags_keys, extra_tags)
    )
    all_tags = required_tags + non_repeating_extra_tags
    deletion_protection = (
        deployment_name == "production"
    )  # ensure prod database cannot be deleted

    snapshot_id = get_latest_db_snapshot(snapshot_db_instance_id)
    rds.restore_db_instance_from_db_snapshot(
        DBInstanceIdentifier=db_instance_id,
        DBSnapshotIdentifier=snapshot_id,
        DBInstanceClass=instance_type,
        Port=5432,
        PubliclyAccessible=True,
        VpcSecurityGroupIds=security_group_ids,
        Tags=all_tags,
        DeletionProtection=deletion_protection,
    )

    print("Successfully cloned new db (" + db_instance_id + ") from snapshot")

    return db_instance_id


def setup_db_route53_entries(deployment_name, db_instance):
    add_subdomains_to_route53(
        domain="tupaia.org",
        subdomains=["db"],
        deployment_name=deployment_name,
        dns_url=db_instance["Endpoint"]["Address"],
    )


def create_db_instance_from_snapshot(
    deployment_name,
    deployment_type,
    snapshot_name,
    instance_type,
    extra_tags=[],
    security_group_code=None,
    security_group_id=None,
):
    db_instance_id = clone_db_from_snapshot(
        deployment_name,
        deployment_type,
        snapshot_name,
        instance_type,
        extra_tags,
        security_group_code,
        security_group_id,
    )

    waiter = rds.get_waiter("db_instance_available")
    waiter.wait(DBInstanceIdentifier=db_instance_id)
    instance = rds.describe_db_instances(DBInstanceIdentifier=db_instance_id)[
        "DBInstances"
    ][0]

    setup_db_route53_entries(deployment_name, instance)

    return instance


async def create_db_instance_from_snapshot_async(
    deployment_name,
    deployment_type,
    snapshot_name,
    instance_type,
    extra_tags=[],
    security_group_code=None,
    security_group_id=None,
):
    db_instance_id = clone_db_from_snapshot(
        deployment_name,
        deployment_type,
        snapshot_name,
        instance_type,
        extra_tags,
        security_group_code,
        security_group_id,
    )

    await wait_for_db_instance(db_instance_id, "available")
    instance = rds.describe_db_instances(DBInstanceIdentifier=db_instance_id)[
        "DBInstances"
    ][0]

    setup_db_route53_entries(deployment_name, instance)

    return instance
