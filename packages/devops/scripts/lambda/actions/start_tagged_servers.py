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

try:
    loop = asyncio.get_event_loop()
except RuntimeError:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)


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

    tasks = [asyncio.ensure_future(start_instance(instance)) for instance in instances]
    loop.run_until_complete(asyncio.wait(tasks))

    print(f"Started {len(instances)} previously stopped instances")
