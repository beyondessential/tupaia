import asyncio
import functools

import boto3
from helpers.creation import create_instance
from helpers.utilities import (
    get_account_ids,
    get_instance,
    get_tag,
    start_instance,
    stop_instance,
)

ec2 = boto3.resource("ec2")
ec = boto3.client("ec2")

try:
    loop = asyncio.get_event_loop()
except RuntimeError:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)


async def wait_for_volume(volume_id, to_be):
    volume_available_waiter = ec.get_waiter("volume_" + to_be)
    await loop.run_in_executor(
        None, functools.partial(volume_available_waiter.wait, VolumeIds=[volume_id])
    )


def get_latest_snapshot_id(deployment_type, deployment_name):
    filters = [
        {"Name": "tag:DeploymentType", "Values": [deployment_type]},
        {"Name": "tag:DeploymentName", "Values": [deployment_name]},
    ]
    account_ids = get_account_ids()
    snapshot_response = ec.describe_snapshots(OwnerIds=account_ids, Filters=filters)
    if "Snapshots" not in snapshot_response or len(snapshot_response["Snapshots"]) == 0:
        raise Exception("No snapshots found")
    snapshot_id = sorted(
        snapshot_response["Snapshots"], key=lambda k: k["StartTime"], reverse=True
    )[0]["SnapshotId"]
    print(f"Found snapshot with ID {snapshot_id}")
    return snapshot_id


async def clone_volume_into_instance(
    instance, deployment_type, deployment_name="production"
):
    print(f"Cloning volume into instance {instance['InstanceId']}")
    # Check it's not protected
    protected = get_tag(instance, "Protected")
    name = get_tag(instance, "Name")
    if protected == "true":
        raise Exception(
            f"The instance {name} is protected and cannot be wiped and cloned"
        )

    # Get snapshot to clone volume from
    snapshot_id = get_latest_snapshot_id(deployment_type, deployment_name)

    # Get the device on the instance that the volume should clone to
    for dev in instance["BlockDeviceMappings"]:
        if dev.get("Ebs", None) is None:
            continue
        dev_to_attach = dev
    print(f"Will attach to {dev_to_attach['DeviceName']}")

    # Detach the old volume
    old_vol_id = dev_to_attach["Ebs"]["VolumeId"]
    old_volume = ec2.Volume(old_vol_id)
    availability_zone = old_volume.availability_zone
    old_volume.detach_from_instance()
    await wait_for_volume(old_vol_id, "available")
    print(f"Volume with ID {old_vol_id} detached")

    # Create new volume from snapshot and attach it to EC2 instance
    new_volume_id = ec.create_volume(
        SnapshotId=snapshot_id,
        AvailabilityZone=availability_zone,
        VolumeType=old_volume.volume_type,
    )["VolumeId"]
    await wait_for_volume(new_volume_id, "available")
    print(f"Created volume with ID {new_volume_id}")

    # Delete old volume, don't need to wait
    print("Deleting old volume")
    old_volume.delete()

    # Attach new volume to instance
    new_volume = ec2.Volume(new_volume_id)
    new_volume.attach_to_instance(
        InstanceId=instance["InstanceId"], Device=dev_to_attach["DeviceName"]
    )
    await wait_for_volume(new_volume_id, "in_use")
    print("Attached cloned volume to instance")

    # Ensure EBS volumes are deleted on termination of instance
    ec.modify_instance_attribute(
        InstanceId=instance["InstanceId"],
        BlockDeviceMappings=[
            {
                "DeviceName": dev_to_attach["DeviceName"],
                "Ebs": {"VolumeId": new_volume_id, "DeleteOnTermination": True},
            }
        ],
    )


def clone_instance(
    deployment_type,
    from_deployment,
    to_deployment,
    instance_type,
    extra_tags=None,
    security_group_code=None,
):
    print(
        f"Creating {instance_type} clone of {deployment_type}: {from_deployment} as {to_deployment}"
    )
    base_instance_filters = [
        {"Name": "tag:DeploymentType", "Values": [deployment_type]},
        {"Name": "tag:DeploymentName", "Values": [from_deployment]},
        {
            "Name": "instance-state-name",
            "Values": ["running", "stopped"],
        },  # ignore terminated instances
    ]
    base_instance = get_instance(base_instance_filters)

    if not base_instance:
        raise Exception(
            f"No instance to clone from for {deployment_type}: {from_deployment}"
        )

    subdomains_via_dns = None
    subdomains_via_dns_string = get_tag(base_instance, "SubdomainsViaDns")
    if subdomains_via_dns_string != "":
        subdomains_via_dns = subdomains_via_dns_string.split(",")

    subdomains_via_gateway = None
    subdomains_via_gateway_string = get_tag(base_instance, "SubdomainsViaGateway")
    if subdomains_via_gateway_string != "":
        subdomains_via_gateway = subdomains_via_gateway_string.split(",")

    iam_role_arn = None
    if "IamInstanceProfile" in base_instance:
        iam_role_arn = base_instance["IamInstanceProfile"]["Arn"]

    new_instance = create_instance(
        to_deployment,
        deployment_type,
        instance_type,
        cloned_from=from_deployment,
        extra_tags=extra_tags,
        iam_role_arn=iam_role_arn,
        image_id=base_instance["ImageId"],
        security_group_code=security_group_code,  # will use id below if no code specified
        security_group_id=base_instance["SecurityGroups"][0]["GroupId"],
        subdomains_via_dns=subdomains_via_dns,
        subdomains_via_gateway=subdomains_via_gateway,
    )
    loop.run_until_complete(stop_instance(new_instance))
    loop.run_until_complete(
        clone_volume_into_instance(new_instance, deployment_type, from_deployment)
    )
    loop.run_until_complete(start_instance(new_instance))

    return new_instance
