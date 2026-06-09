"""
Starts any database tagged with "StartAtUTC" that is currently stopped, and due to be started
within the last hour

Example config
{
  "Action": "start_tagged_databases",
  "User": "edwin"
}
"""

import asyncio
import time

from helpers.rds import find_db_instances, start_db_instance, wait_for_db_instance


async def _start_db_instances(instances):
    tasks = [start_and_wait_for_db(instance) for instance in instances]
    return await asyncio.gather(*tasks)


def start_tagged_databases(event):
    hour = time.strftime("%H:00")
    tagged_instances = find_db_instances(
        [
            {"Key": "StartAtUTC", "Values": [hour]},
            {"Key": "DeploymentType", "Values": ["tupaia"]},
        ]
    )

    stopped_instances = list(
        filter(lambda x: x["DBInstanceStatus"] == "stopped", tagged_instances)
    )

    if not stopped_instances:
        print("No stopped instances required starting")
        return

    _ = asyncio.run(_start_db_instances(stopped_instances))
    print(f"{len(stopped_instances)} previously stopped instances started")


async def start_and_wait_for_db(db_instance):
    db_id = db_instance["DBInstanceIdentifier"]
    start_db_instance(db_id)
    await wait_for_db_instance(db_id, "available")
