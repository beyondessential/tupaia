"""
Creates a new deployment of DHIS2 hosted within the tupaia.org domain

Example configs

1. Spin up new deployment of Tonga DHIS2
{
  "Action": "spin_up_dhis_deployment",
  "User": "edwin",
  "DeploymentType": "tonga-dhis2",
  "DeploymentName": "tonga-for-testing",
  "FromDeployment": "production"
}

2. Spin up a new deployment of the regional DHIS2, with a custom instance size and security group
{
  "Action": "spin_up_dhis_deployment",
  "User": "edwin",
  "DeploymentType": "tonga-dhis2",
  "DeploymentName": "fast-regional-agg",
  "FromDeployment": "production",
  "InstanceType": "t3a.2xlarge",
  "SecurityGroupCode": "tupaia-prod-sg"
}
"""

import asyncio
from helpers.clone import clone_instance


def spin_up_dhis_deployment(event):
    # validate input config
    if "DeploymentType" not in event:
        raise Exception(
            'You must include the key "DeploymentType" in the lambda config to indicate whether this is for regional-dhis2, tonga-dhis2, etc.'
        )
    deployment_type = event["DeploymentType"]

    if "FromDeployment" not in event:
        raise Exception(
            'You must include the key "FromDeployment" in the lambda config to indicate which database snapshot to use.'
        )
    from_deployment = event["FromDeployment"]

    if "DeploymentName" not in event:
        raise Exception(
            'You must include the key "DeploymentName" in the lambda config, to name the new deployment.'
        )
    deployment_name = event["DeploymentName"]

    if "InstanceType" not in event:
        raise Exception(
            'You must include the key "InstanceType" in the lambda config. We recommend "t3a.medium" unless you need more speed.'
        )
    instance_type = event["InstanceType"]

    # Use security group tagged with code
    security_group_code = event.get("SecurityGroupCode", "tupaia-dev-sg")

    extra_tags = [{"Key": "DeployedBy", "Value": event["User"]}]

    if "StartAtUTC" in event:
        extra_tags.append({"Key": "StartAtUTC", "Value": event["StartAtUTC"]})

    if "StopAtUTC" in event:
        extra_tags.append({"Key": "StopAtUTC", "Value": event["StopAtUTC"]})

    _ = asyncio.run(
        clone_instance(
            deployment_type,
            from_deployment,
            deployment_name,
            instance_type,
            extra_tags=extra_tags,
            security_group_code=security_group_code,
        )
    )

    print("Deployment cloned")
