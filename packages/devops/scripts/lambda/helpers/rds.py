import asyncio
import functools

import boto3

resource_group_tagging_api = boto3.client("resourcegroupstaggingapi")
rds = boto3.client("rds")

try:
    loop = asyncio.get_event_loop()
except RuntimeError:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)


def get_db_instance(db_id):
    instances_response = rds.describe_db_instances(DBInstanceIdentifier=db_id)

    if "DBInstances" not in instances_response or not instances_response["DBInstances"]:
        raise Exception("No instance found")

    if len(instances_response["DBInstances"]) > 1:
        raise Exception("Multiple instances found")

    return instances_response["DBInstances"][0]


def get_all_db_instances():
    instances_response = rds.describe_db_instances()
    return instances_response["DBInstances"]


def find_db_instances(filters):
    tagged_resources_response = resource_group_tagging_api.get_resources(
        TagFilters=filters, ResourceTypeFilters=["rds"]
    )

    if (
        "ResourceTagMappingList" not in tagged_resources_response
        or len(tagged_resources_response["ResourceTagMappingList"]) == 0
    ):
        return []

    db_arns = map(
        lambda x: x["ResourceARN"], tagged_resources_response["ResourceTagMappingList"]
    )
    return list(map(lambda x: get_db_instance(x), db_arns))


def set_db_instance_master_password(db_id, password):
    rds.modify_db_instance(
        DBInstanceIdentifier=db_id, MasterUserPassword=password, ApplyImmediately=True
    )


def rename_db_instance(db_id, new_db_id):
    rds.modify_db_instance(
        DBInstanceIdentifier=db_id,
        NewDBInstanceIdentifier=new_db_id,
        ApplyImmediately=True,
    )


def start_db_instance(db_id):
    rds.start_db_instance(DBInstanceIdentifier=db_id)


def stop_db_instance(db_id):
    rds.stop_db_instance(DBInstanceIdentifier=db_id)


def get_latest_db_snapshot(source_db_id):
    snapshots_response = rds.describe_db_snapshots(DBInstanceIdentifier=source_db_id)

    if (
        "DBSnapshots" not in snapshots_response
        or len(snapshots_response["DBSnapshots"]) == 0
    ):
        raise Exception("No snapshots found")

    latest_snapshot_id = sorted(
        snapshots_response["DBSnapshots"],
        key=lambda k: k["SnapshotCreateTime"],
        reverse=True,
    )[0]["DBSnapshotIdentifier"]
    print("Found snapshot with id " + latest_snapshot_id)
    return latest_snapshot_id


async def wait_for_db_instance(instance_id, to_be):
    waiter = rds.get_waiter("db_instance_" + to_be)
    await loop.run_in_executor(
        None, functools.partial(waiter.wait, DBInstanceIdentifier=instance_id)
    )
