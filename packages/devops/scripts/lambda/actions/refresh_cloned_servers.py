"""
Replaces the volume of any cloned application servers with the latest snapshot from the original
clone volume

Example configs

1. Refresh all cloned servers (i.e. those with the tag "ClonedFrom")
{
  "Action": "refresh_cloned_servers",
  "User": "edwin"
}

2. Refresh all servers cloned from a specific base, e.g. all tupaia-db instances
{
  "Action": "refresh_cloned_servers",
  "User": "edwin",
  "ClonedFrom": "tupaia-db"
}

3. Refresh a specific server
{
  "Action": "refresh_cloned_servers",
  "User": "edwin",
  "DeploymentName": "edwin-test"
}
"""

import asyncio

from helpers.clone import clone_volume_into_instance
from helpers.utilities import find_instances, get_tag, start_instance, stop_instance


async def _refresh_instance(instance):
    print(f"Refreshing instance {instance['InstanceId']}...")
    is_running = instance["State"]["Name"] == "running"

    if is_running:
        await stop_instance(instance)

    await clone_volume_into_instance(
        instance, get_tag(instance, "DeploymentType"), get_tag(instance, "ClonedFrom")
    )

    if is_running:
        await start_instance(instance)

    print(f"Refreshed instance {instance['InstanceId']}")


async def _refresh_instances(instances):
    tasks = [_refresh_instance(instance) for instance in instances]
    return await asyncio.gather(*tasks)


def refresh_cloned_servers(event):
    filters = [{"Name": "tag-key", "Values": ["ClonedFrom"]}]
    if "ClonedFrom" in event:
        print(f"Refreshing instances cloned from {event["ClonedFrom"]}")
        filters.append({"Name": "tag:ClonedFrom", "Values": [event["ClonedFrom"]]})
    if "DeploymentName" in event:
        print(f"Refreshing the {event["DeploymentName"]} clone")
        filters.append(
            {"Name": "tag:DeploymentName", "Values": [event["DeploymentName"]]}
        )

    running_instances = find_instances(
        filters + [{"Name": "instance-state-name", "Values": ["running"]}]
    )
    stopped_instances = find_instances(
        filters + [{"Name": "instance-state-name", "Values": ["stopped"]}]
    )

    instances = running_instances + stopped_instances

    if not instances:
        print("No clones to refresh")
        return

    print(
        f"Refreshing {len(instances)} clones ({len(running_instances)} running + {len(stopped_instances)} stopped)"
    )
    _ = asyncio.run(_refresh_instances(instances))
    print(f"Refreshed {len(instances)} clones")
