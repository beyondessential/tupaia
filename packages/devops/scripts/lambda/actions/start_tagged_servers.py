"""
Starts any server tagged with "StartAtUTC" that is currently stopped, and due to be started
within the last hour

Example config
{
  "Action": "start_tagged_servers",
  "User": "edwin"
}
"""

import asyncio
import time

from helpers.utilities import find_instances, start_instance


async def _start_instances(instances):
    tasks = [start_instance(instance) for instance in instances]
    return await asyncio.gather(*tasks)


def start_tagged_servers(event):
    print("Starting stopped servers with StartAtUTC tag")

    hour = time.strftime("%H:00")
    instances = find_instances(
        [
            {"Name": "tag:StartAtUTC", "Values": [hour]},
            {"Name": "instance-state-name", "Values": ["stopped"]},
        ]
    )

    if not instances:
        print("No stopped instances to start")
        return

    asyncio.run(_start_instances(instances))
    print(f"Started {len(instances)} previously stopped instances")
