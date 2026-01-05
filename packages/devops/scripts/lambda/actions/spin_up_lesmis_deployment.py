"""
Creates a new deployment of LESMIS with a specific branch checked out

Example config

1. Spin up a new feature branch deployment of LESMIS, that will be deleted after 8 hours
{
  "Action": "spin_up_lesmis_deployment",
  "User": "edwin",
  "Branch": "wai-965",
  "DbDumpFile": "lesmis-on-premise/lesmis-dump-tupaia-202404091048.sql",
  "HoursOfLife": 8
}
"""

from pathlib import Path

from helpers.create_from_image import create_server_instance_from_image
from helpers.utilities import build_extra_tags, find_instances


def spin_up_lesmis_deployment(event):
    # validate input config
    if "DeploymentName" not in event:
        raise Exception(
            'You must include the key "DeploymentName" in the lambda config, e.g. "dev".'
        )

    deployment_name = event["DeploymentName"]
    # branch defaults to deployment name if not specified
    branch = event.get("Branch", deployment_name)

    if deployment_name == "production" and branch != "master":
        raise Exception(
            "The production deployment needs to check out master, not " + branch
        )

    # find current instances
    existing_instances = find_instances(
        [
            {"Name": "tag:DeploymentName", "Values": [deployment_name]},
            {"Name": "tag:DeploymentType", "Values": ["lesmis"]},
            {
                "Name": "instance-state-name",
                "Values": ["running", "stopped"],
            },  # ignore terminated instances
        ]
    )

    if existing_instances:
        raise Exception(
            "A deployment already exists, perhaps you want to redeploy and swap out the existing one? The easiest way is to push a new commit."
        )

    if "DbDumpFile" not in event:
        raise Exception(
            "You must include the file location of a dump of the lesmis database in S3"
        )
    db_dump_file = event.get("DbDumpFile")

    # get manual input parameters, or default for any not provided
    instance_type = event.get("InstanceType", "t3a.large")
    # Use AMI tagged with code
    image_code = event.get("ImageCode", "lesmis-gold-master")
    # Use security group tagged with code
    security_group_code = event.get("SecurityGroupCode", "tupaia-dev-sg")

    # launch server instance based on gold master AMI
    server_extra_tags = build_extra_tags(
        event,
        # Default to turning off between 7pm AEST and 8am NZDT, i.e. all work hours throughout the year
        {"StopAtUTC": "09:00", "StartAtUTC": "19:00"},
    )

    server_extra_tags.append({"Key": "DbDumpFile", "Value": db_dump_file})

    create_server_instance_from_image(
        deployment_name,
        branch,
        instance_type,
        image_code,
        deployment_type="lesmis",
        startup_script=Path("./resources/startupLesmis.sh").read_text(),
        volume_size=50,
        extra_tags=server_extra_tags,
        security_group_code=security_group_code,
        setup_gateway=False,
        setup_dns=True,
    )

    print("Successfully deployed branch " + branch)
