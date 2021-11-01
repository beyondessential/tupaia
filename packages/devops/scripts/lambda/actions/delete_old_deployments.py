import time
from helpers.utilities import find_instances
from helpers.teardown import teardown_instance

# Deletes all deployments with an expired "DeleteAt" tag

def delete_old_deployments():
    current_date_and_hour = time.strftime("%Y-%m-%d %H:00")
    filters = [
        {'Name': 'instance-state-name', 'Values': ['running', 'stopped']}, # ignore terminated instances
        {'Name': 'tag:DeleteAt', 'Values': [current_date_and_hour]}
    ]
    instances = find_instances(filters)

    for instance in instances:
        teardown_instance(instance)
