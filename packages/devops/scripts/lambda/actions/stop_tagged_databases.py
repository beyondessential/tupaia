"""
Stops any database tagged with "StopAtUTC" that is currently available, and due to be stopped
within the last hour

Example config
{
  "Action": "stop_tagged_databases",
  "User": "edwin"
}
"""

import time

from helpers.rds import find_db_instances, stop_db_instance


def stop_tagged_databases(event):
    hour = time.strftime("%H:00")
    tagged_instances = find_db_instances(
        [
            {"Key": "StopAtUTC", "Values": [hour]},
            {"Key": "DeploymentType", "Values": ["tupaia"]},
        ]
    )

    available_instances = list(
        filter(lambda x: x["DBInstanceStatus"] == "available", tagged_instances)
    )

    if not available_instances:
        print("No available instances required stopping")
        return

    print(
        f"Stopping {len(available_instances)} previously available database instances"
    )

    instance_ids = list(map(lambda x: x["DBInstanceIdentifier"], available_instances))
    for instance_id in instance_ids:
        stop_db_instance(instance_id)
