import time
from datetime import datetime
from helpers.utilities import find_instances, get_tag
from helpers.teardown import teardown_instance

# Deletes all deployments with an expired "DeleteAfter" tag

def delete_old_deployments(event):
    current_datetime = datetime.now()
    current_date = time.strftime("%Y-%m-%d")
    filters = [
        {'Name': 'instance-state-name', 'Values': ['running', 'stopped']}, # ignore terminated instances
        {'Name': 'tag:DeleteAfter', 'Values': [current_date + '*']} # get any due to be deleted this hour
    ]
    instances = find_instances(filters)

    for instance in instances:
        delete_instance_after = datetime.strptime(get_tag(instance, 'DeleteAfter'), "%Y-%m-%d %H:%M")
        if current_datetime > delete_instance_after:
            teardown_instance(instance)
