import time
import datetime
from helpers.utilities import find_instances, get_tag
from helpers.teardown import teardown_instance

# Deletes all deployments with an expired "DeleteAfter" tag

def delete_old_deployments(event):
    current_datetime = datetime.now()
    current_date_and_hour = time.strftime("%Y-%m-%d %H")
    filters = [
        {'Name': 'instance-state-name', 'Values': ['running', 'stopped']}, # ignore terminated instances
        {'Name': 'tag:DeleteAfter', 'Values': [current_date_and_hour + '*']} # get any due to be deleted this hour
    ]
    instances = find_instances(filters)

    for instance in instances:
        delete_instance_after = datetime.strptime(get_tag(instance, 'DeleteAfter'), "%Y-%m-%d %H:%M")
        if current_datetime > delete_instance_after:
            teardown_instance(instance)
