from datetime import datetime

from botocore.exceptions import ClientError

from helpers.teardown import teardown_instance
from helpers.utilities import find_instances, get_tag

# IAM/auth failures we want to surface (via Lambda error metric) rather than
# silently log and skip — otherwise a missing permission means the cron does
# nothing forever with no alarm.
AUTH_ERROR_CODES = {"AccessDenied", "UnauthorizedOperation"}


def delete_old_servers(event):
    """
    Deletes all servers with an expired "DeleteAfter" tag
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
            try:
                teardown_instance(instance)
            except ClientError as e:
                if e.response.get("Error", {}).get("Code") in AUTH_ERROR_CODES:
                    raise
                print(f"Failed to tear down {get_tag(instance, 'Name')}: {e}")
            except Exception as e:
                # Don't let one failed teardown block the rest of the cron run
                print(f"Failed to tear down {get_tag(instance, 'Name')}: {e}")
