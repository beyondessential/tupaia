"""
Stops any server tagged with "StopAtUTC" that is currently running, and due to be stopped
within the last hour

Example config
{
  "Action": "stop_tagged_servers",
  "User": "edwin"
}
"""

import asyncio
import time

from helpers.utilities import find_instances, stop_instance


async def _stop_instances(instances):
    tasks = [stop_instance(instance) for instance in instances]
    return await asyncio.gather(*tasks)


def stop_tagged_servers(event):
    print("Stopping running servers with StopAtUTC tag")
    hour = time.strftime("%H:00")
    instances = find_instances(
        [
            {"Name": "tag:StopAtUTC", "Values": [hour]},
            {"Name": "instance-state-name", "Values": ["running"]},
        ]
    )

    if not instances:
        print("No running instances to stop")
        return

    _ = asyncio.run(_stop_instances(instances))

    print(f"Stopped {len(instances)} previously running instances")
