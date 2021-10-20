import asyncio

from helpers.clone import clone_volume_into_instance
from helpers.utilities import find_instances, get_tag

loop = asyncio.get_event_loop()

# Replaces the volume of any cloned instance with the latest snapshot from the original clone volume
def refresh_cloned_instances(event):
    filters = [
        { 'Name': 'tag-key', 'Values': ['ClonedFrom'] }
    ]
    if 'ClonedFrom' in event:
      print('Refreshing instances cloned from ' + event['ClonedFrom'])
      filters.append({'Name': 'tag:ClonedFrom', 'Values': [event['ClonedFrom']]})
    if 'Branch' in event:
      print('Refreshing the ' + event['Branch'] + ' branch clone')
      filters.append({'Name': 'tag:Stage', 'Values': [event['Branch']]})

    instances = find_instances(filters)

    if len(instances) == 0:
      print('No clones to refresh')
      return

    tasks = sum(
    [
        [asyncio.ensure_future(clone_volume_into_instance(instance, get_tag(instance, 'ClonedFrom'))) for instance in instances]
    ], [])
    loop.run_until_complete(asyncio.wait(tasks))
    print('Finished refreshing all clones')
