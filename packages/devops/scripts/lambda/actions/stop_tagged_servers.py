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

try:
    loop = asyncio.get_event_loop()
except RuntimeError:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)


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

    tasks = [asyncio.ensure_future(stop_instance(instance)) for instance in instances]
    loop.run_until_complete(asyncio.wait(tasks))

    print(f"Stopped {len(instances)} previously running instances")
