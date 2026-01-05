"""
Swaps an ELB to point at a new tupaia server, and kills the old one(s) for a given deployment.

This is called by the startup script on the instance as the second phase of
"redeploy_tupaia_server", and shouldn’t generally be used directly
"""

from helpers.networking import get_instance_behind_gateway, swap_gateway_instance
from helpers.teardown import terminate_instance
from helpers.utilities import add_tag, find_instances, get_instance_by_id, get_tag


def swap_out_tupaia_server(event):
    # validate input config
    if "DeploymentName" not in event:
        raise Exception(
            'You must include the key "DeploymentName" in the lambda config, e.g. "dev".'
        )
    deployment_name = event["DeploymentName"]

    if "NewInstanceId" not in event:
        raise Exception(
            'You must include the key "NewInstanceId" in the lambda config, e.g. "dev".'
        )
    new_instance_id = event["NewInstanceId"]

    new_instance = get_instance_by_id(new_instance_id)
    if not new_instance:
        raise Exception(
            f"Couldn’t find new instance with ID {new_instance_id} to swap in"
        )

    old_instance = get_instance_behind_gateway("tupaia", deployment_name)
    if not old_instance:
        raise Exception(
            f"Couldn’t find old instance with name {deployment_name} to swap out"
        )

    # set up ELB from the old instance to point at the new one
    swap_gateway_instance(
        "tupaia", deployment_name, old_instance["InstanceId"], new_instance_id
    )

    # add the subdomain tags that now relate to the new instance
    add_tag(
        new_instance_id,
        "SubdomainsViaGateway",
        get_tag(old_instance, "SubdomainsViaGateway"),
    )

    # delete old instance(s)
    instance_filters = [
        {"Name": "tag:DeploymentName", "Values": [deployment_name]},
        {"Name": "tag:DeploymentType", "Values": ["tupaia"]},
        {
            "Name": "tag:StartupBuildProgress",
            "Values": ["complete", "errored"],
        },  # do not select building as they may be a newer deployment that is coming
        {
            "Name": "instance-state-name",
            "Values": ["running", "stopped"],
        },  # ignore terminated instances
    ]
    instances = find_instances(instance_filters)

    for instance in instances:
        if instance["InstanceId"] == new_instance_id:
            continue
        print(f"Deleting old instance {instance["InstanceId"]}")
        terminate_instance(instance)

    print(
        f"Swapped out {deployment_name} ({old_instance["InstanceId"]} → {new_instance_id})"
    )
