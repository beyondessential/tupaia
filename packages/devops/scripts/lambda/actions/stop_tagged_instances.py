import asyncio
import time
from helpers.utilities import find_instances, stop_instance

loop = asyncio.get_event_loop()

def stop_tagged_instances():
    hour = time.strftime("%H:00")
    instances = find_instances([
        { 'Name': 'tag:StopAtUTC', 'Values': [hour] },
        { 'Name': 'instance-state-name', 'Values': ['running'] }
    ])

    if len(instances) > 0:
        tasks = sum(
        [
            [asyncio.ensure_future(stop_instance(instance)) for instance in instances]
        ], [])
        loop.run_until_complete(asyncio.wait(tasks))
        print('All previously running instances stopped')
    else:
      print('No running instances required stopping')
