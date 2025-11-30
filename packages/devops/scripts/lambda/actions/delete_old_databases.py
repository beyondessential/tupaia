from datetime import datetime
from helpers.teardown import teardown_db_instance
from helpers.rds import find_db_instances
from helpers.utilities import get_db_tag

# Deletes all databases with an expired "DeleteAfter" tag


def delete_old_databases(event):
    current_datetime = datetime.now()
    filters = [{"Key": "DeleteAfter"}, {"Key": "DeploymentType", "Values": ["tupaia"]}]

    instances = find_db_instances(filters)
    instances_for_deletion = list(
        filter(lambda instance: instance["DBInstanceStatus"] != "deleting", instances)
    )  # Filter out instances already being deleted

    for instance_to_delete in instances_for_deletion:
        delete_instance_after = datetime.strptime(
            get_db_tag(instance_to_delete, "DeleteAfter"), "%Y-%m-%d %H:%M"
        )
        if current_datetime > delete_instance_after:
            db_id = instance_to_delete["DBInstanceIdentifier"]
            teardown_db_instance(db_id=db_id)
