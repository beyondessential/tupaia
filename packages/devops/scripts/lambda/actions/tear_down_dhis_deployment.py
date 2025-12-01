"""
Terminates an instance and any associated elastic ip, route53 entries, load balancer, and gateway

Example config
{
  "Action": "tear_down_dhis_deployment",
  "User": "edwin",
  "DeploymentName": "wai-965",
  "DeploymentType": "tonga-dhis2"
}
"""

from helpers.teardown import teardown_instance
from helpers.utilities import get_instance


def tear_down_dhis_deployment(event):
    if "DeploymentName" not in event:
        raise Exception("Must provide DeploymentName when tearing down an instance")

    if "DeploymentType" not in event:
        raise Exception("Must provide DeploymentType when tearing down an instance")

    filters = [
        {"Name": "tag:DeploymentName", "Values": [event["DeploymentName"]]},
        {"Name": "tag:DeploymentType", "Values": [event["DeploymentType"]]},
        {
            "Name": "instance-state-name",
            "Values": ["running", "stopped"],
        },  # ignore terminated instances
    ]
    instance = get_instance(filters)

    if not instance:
        raise Exception("No matching instance found")

    teardown_instance(instance)

    print("Finished tearing down clone")
