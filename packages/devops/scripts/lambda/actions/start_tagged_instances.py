# Starts any instance tagged with "StartAtUTC" that is currently stopped, and due to be started
# within the last hour
#
# Example config
# {
#   "Action": "start_tagged_instances",
#   "User": "edwin"
# }

import asyncio
import time
from helpers.utilities import find_instances, start_instance

loop = asyncio.get_event_loop()

def start_tagged_instances(event):
    hour = time.strftime("%H:00")
    instances = find_instances([
        { 'Name': 'tag:StartAtUTC', 'Values': [hour] },
        { 'Name': 'instance-state-name', 'Values': ['stopped'] }
    ])

    if len(instances) > 0:
      tasks = sum(
      [
          [asyncio.ensure_future(start_instance(instance)) for instance in instances]
      ], [])
      loop.run_until_complete(asyncio.wait(tasks))
      print('All previously stopped instances started')
    else:
      print('No stopped instances required starting')
