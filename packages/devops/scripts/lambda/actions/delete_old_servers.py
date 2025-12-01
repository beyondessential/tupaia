from datetime import datetime

from helpers.teardown import teardown_instance
from helpers.utilities import find_instances, get_tag


def delete_old_servers(event):
    """
    # Deletes all servers with an expired "DeleteAfter" tag
    """
    current_datetime = datetime.now()
    filters = [
        {
            "Name": "instance-state-name",
            "Values": ["running", "stopped"],
        },  # ignore terminated instances
        {"Name": "tag:DeleteAfter", "Values": ["*"]},
    ]
    instances = find_instances(filters)

    for instance in instances:
        delete_instance_after = datetime.strptime(
            get_tag(instance, "DeleteAfter"), "%Y-%m-%d %H:%M"
        )
        if current_datetime > delete_instance_after:
            teardown_instance(instance)
