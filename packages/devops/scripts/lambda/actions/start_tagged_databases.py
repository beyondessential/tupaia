# Starts any database tagged with "StartAtUTC" that is currently stopped, and due to be started
# within the last hour
#
# Example config
# {
#   "Action": "start_tagged_databases",
#   "User": "edwin"
# }

import asyncio
import time

from helpers.rds import find_db_instances, start_db_instance, wait_for_db_instance

loop = asyncio.get_event_loop()


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

    if len(stopped_instances) > 0:
        tasks = sum(
            [
                [
                    asyncio.ensure_future(start_and_wait_for_db(instance))
                    for instance in stopped_instances
                ]
            ],
            [],
        )
        loop.run_until_complete(asyncio.wait(tasks))
        print(str(len(stopped_instances)) + " previously stopped instances started")
    else:
        print("No stopped instances required starting")


async def start_and_wait_for_db(db_instance):
    db_id = db_instance["DBInstanceIdentifier"]
    start_db_instance(db_id)
    await wait_for_db_instance(db_id, "available")
