# Replaces the volume of any cloned instance with the latest snapshot from the original clone volume
# N.B. will only work on stopped instances
#
# Example configs
#
# 1. Refresh all cloned instances (i.e. those with the tag "ClonedFrom")
# {
#   "Action": "refresh_cloned_instances"
# }
#
# 2. Refresh all instances cloned from a specific base, e.g. all tupaia-db instances
# {
#   "Action": "refresh_cloned_instances",
#   "ClonedFrom": "tupaia-db"
# }
#
# 3. Refresh a specific instance (remember, it still needs to be stopped first)
# {
#   "Action": "refresh_cloned_instances",
#   "ClonedFrom": "tupaia-db",
#   "Branch": "wai-965"
# }


import asyncio

from helpers.clone import clone_volume_into_instance
from helpers.utilities import find_instances, get_tag, start_instance, stop_instance

loop = asyncio.get_event_loop()

def refresh_cloned_instances(event):
    filters = [
        { 'Name': 'tag-key', 'Values': ['ClonedFrom'] }
    ]
    if 'ClonedFrom' in event:
      print('Refreshing instances cloned from ' + event['ClonedFrom'])
      filters.append({'Name': 'tag:ClonedFrom', 'Values': [event['ClonedFrom']]})
    if 'Branch' in event:
      print('Refreshing the ' + event['Branch'] + ' branch clone')
      filters.append({'Name': 'tag:Branch', 'Values': [event['Branch']]})


    running_instances = find_instances(filters + [{ 'Name': 'instance-state-name', 'Values': ['running'] }])
    stopped_instances = find_instances(filters + [{ 'Name': 'instance-state-name', 'Values': ['stopped'] }])

    instances = running_instances + stopped_instances

    if len(instances) == 0:
      print('No clones to refresh')
      return

    if len(running_instances) > 0:
      stop_tasks = sum(
      [
          [asyncio.ensure_future(stop_instance(instance)) for instance in running_instances]
      ], [])
      loop.run_until_complete(asyncio.wait(stop_tasks))

    clone_tasks = sum(
    [
        [asyncio.ensure_future(clone_volume_into_instance(instance, get_tag(instance, 'ClonedFrom'))) for instance in instances]
    ], [])
    loop.run_until_complete(asyncio.wait(clone_tasks))

    if len(running_instances) > 0:
      start_tasks = sum(
      [
          [asyncio.ensure_future(start_instance(instance)) for instance in running_instances]
      ], [])
      loop.run_until_complete(asyncio.wait(start_tasks))

    print('Finished refreshing all clones')
