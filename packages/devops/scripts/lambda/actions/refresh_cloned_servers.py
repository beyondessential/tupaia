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

try:
    loop = asyncio.get_event_loop()
except RuntimeError:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)


def refresh_cloned_servers(event):
    filters = [{"Name": "tag-key", "Values": ["ClonedFrom"]}]
    if "ClonedFrom" in event:
        print("Refreshing instances cloned from " + event["ClonedFrom"])
        filters.append({"Name": "tag:ClonedFrom", "Values": [event["ClonedFrom"]]})
    if "DeploymentName" in event:
        print("Refreshing the " + event["DeploymentName"] + " clone")
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

    stop_tasks = [
        asyncio.ensure_future(stop_instance(instance)) for instance in running_instances
    ]
    loop.run_until_complete(asyncio.wait(stop_tasks))

    clone_tasks = [
        asyncio.ensure_future(
            clone_volume_into_instance(
                instance,
                get_tag(instance, "DeploymentType"),
                get_tag(instance, "ClonedFrom"),
            )
        )
        for instance in instances
    ]
    loop.run_until_complete(asyncio.wait(clone_tasks))

    start_tasks = [
        asyncio.ensure_future(start_instance(instance))
        for instance in running_instances
    ]
    loop.run_until_complete(asyncio.wait(start_tasks))

    print(f"Finished refreshing {len(running_instances)} clones")
