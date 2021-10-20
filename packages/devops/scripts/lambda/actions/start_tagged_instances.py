import asyncio
import time
from helpers.utilities import *

loop = asyncio.get_event_loop()

def start_tagged_instances():
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
