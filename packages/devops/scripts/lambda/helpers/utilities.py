import asyncio
import functools
import re
from datetime import datetime, timedelta

import boto3

ec2 = boto3.resource("ec2")
ec = boto3.client("ec2")
iam = boto3.client("iam")

try:
    loop = asyncio.get_event_loop()
except RuntimeError:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)


def get_account_ids():
    account_ids = list()
    try:
        account_ids.append(iam.get_user()["User"]["Arn"].split(":")[4])
    except Exception as e:
        # use the exception message to get the account ID the function executes under
        account_ids.append(re.search(r"(arn:aws:sts::)([0-9]+)", str(e)).groups()[1])

    return account_ids


def get_tag(instance, tag_name):
    try:
        tag_value = [t.get("Value") for t in instance["Tags"] if t["Key"] == tag_name][
            0
        ]
    except IndexError:
        tag_value = ""
    return tag_value


def get_db_tag(db_instance, tag_name):
    return next(filter(lambda item: item["Key"] == tag_name, db_instance["TagList"]))[
        "Value"
    ]


def add_tag(instance_id, tag_name, tag_value):
    ec.create_tags(
        Resources=[instance_id], Tags=[{"Key": tag_name, "Value": tag_value}]
    )


def get_instance(filters):
    reservations = ec.describe_instances(Filters=filters).get("Reservations", [])
    if len(reservations) == 0:
        return None
    instances = reservations[0]["Instances"]
    if len(instances) == 0:
        return None
    return instances[0]


def get_instance_by_id(id):
    return get_instance(
        [
            {"Name": "instance-id", "Values": [id]},
            {
                "Name": "instance-state-name",
                "Values": ["running", "stopped"],
            },  # ignore terminated instances
        ]
    )


def find_instances(filters):
    reservations = ec.describe_instances(Filters=filters).get("Reservations", [])
    return [i for r in reservations for i in r["Instances"]]


def tags_contains(tags, key, value):
    tags_matching_key = list(filter(lambda x: x["Key"] == key, tags))
    if len(tags_matching_key) == 0:
        return False
    tag_matching_key = tags_matching_key[0]
    return tag_matching_key["Value"] == value


async def wait_for_instance(instance_id, to_be):
    volume_available_waiter = ec.get_waiter("instance_" + to_be)
    await loop.run_in_executor(
        None, functools.partial(volume_available_waiter.wait, InstanceIds=[instance_id])
    )


async def stop_instance(instance):
    instance_object = ec2.Instance(instance["InstanceId"])
    instance_object.stop()
    print("Stopping instance " + instance_object.id)
    await wait_for_instance(instance_object.id, "stopped")
    print("Stopped instance with id " + instance_object.id)


async def start_instance(instance):
    instance_object = ec2.Instance(instance["InstanceId"])
    instance_object.start()
    print("Starting instance " + instance_object.id)
    await wait_for_instance(instance_object.id, "running")
    print("Started instance with id " + instance_object.id)


def build_extra_tags(event, defaults):
    extra_tags = [{"Key": "DeployedBy", "Value": event["User"]}]
    if "HoursOfLife" in event:
        delete_after = datetime.now() + timedelta(hours=event["HoursOfLife"])
        extra_tags.append(
            {"Key": "DeleteAfter", "Value": format(delete_after, "%Y-%m-%d %H:%M")}
        )

    if event["DeploymentName"] == "production":
        if "StartAtUTC" in event or "StopAtUTC" in event:
            raise Exception("Production deployment cannot have StartAtUTC/StopAtUTC")
    else:
        if "StartAtUTC" in event:
            extra_tags.append({"Key": "StartAtUTC", "Value": event["StartAtUTC"]})
        else:
            extra_tags.append({"Key": "StartAtUTC", "Value": defaults["StartAtUTC"]})

        if "StopAtUTC" in event:
            extra_tags.append({"Key": "StopAtUTC", "Value": event["StopAtUTC"]})
        else:
            extra_tags.append({"Key": "StopAtUTC", "Value": defaults["StopAtUTC"]})

    return extra_tags
