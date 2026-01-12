"""
Creates a new deployment of Tupaia with a specific branch checked out.

Example configs

1. Spin up a new feature branch deployment of Tupaia, that will be deleted after 8 hours
{
   "Action": "spin_up_tupaia_deployment",
   "User": "edwin",
   "Branch": "wai-965",
   "HoursOfLife": 8
}

2. Spin up a new deployment of Tupaia, but with the db cloned from dev and a different branch
   checked out (wai-965) to its url prefix (timing-test), and specifying the instance type
{
   "Action": "spin_up_tupaia_deployment",
   "User": "edwin",
   "DeploymentName": "timing-test",
   "Branch": "wai-965",
   "CloneDbFrom": "dev",
   "InstanceType": "t3.2xlarge"
}

3. Spin up a new deployment of Tupaia, but using a different AMI for the server and different base
   instance for the db
{
   "Action": "spin_up_tupaia_deployment",
   "User": "edwin",
   "Branch": "wai-965",
   "ImageCode": "edwin-test-server",
   "SecurityGroupCode": "edwin-test-server",
   "CloneDbFrom": "edwin-test-db"
}
N.B. Example 3 is unusual and generally just used for debugging the redeploy process itself. If used
used, you need to tag the AMI and security groups with the codes you specify.
"""

from helpers.create_from_image import create_server_instance_from_image
from helpers.creation import create_db_instance_from_snapshot
from helpers.rds import set_db_instance_master_password
from helpers.secrets import get_db_master_password
from helpers.utilities import build_extra_tags, find_instances


def spin_up_tupaia_deployment(event):
    # validate input config
    if "DeploymentName" not in event:
        raise Exception(
            'You must include the key "DeploymentName" in the lambda config, e.g. "dev".'
        )
    deployment_name = event["DeploymentName"]
    branch = event.get(
        "Branch", deployment_name
    )  # branch defaults to deployment name if not specified
    if deployment_name == "production" and branch != "master":
        raise Exception(
            "The production deployment needs to check out master, not " + branch
        )

    # find current instances
    existing_instances = find_instances(
        [
            {"Name": "tag:DeploymentName", "Values": [deployment_name]},
            {"Name": "tag:DeploymentType", "Values": ["tupaia"]},
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

    # get manual input parameters, or default for any not provided
    instance_type = event.get("InstanceType", "t3a.large")
    db_instance_type = event.get("DbInstanceType", "db.t4g.medium")
    # Use AMI tagged with code
    image_code = event.get("ImageCode", "tupaia-gold-master")
    # Use security group tagged with code
    security_group_code = event.get("SecurityGroupCode", "tupaia-dev-sg")
    # Use volume snapshot tagged with deployment name
    clone_db_from = event.get("CloneDbFrom", "production")

    # launch server instance based on gold master AMI
    server_extra_tags = build_extra_tags(
        event,
        # Default to turning off between 7pm AEST and 8am NZDT, i.e. all work hours throughout the year
        {"StopAtUTC": "09:00", "StartAtUTC": "19:00"},
    )
    create_server_instance_from_image(
        deployment_name,
        branch,
        instance_type,
        image_code,
        extra_tags=server_extra_tags,
        security_group_code=security_group_code,
    )

    # create db instance from a snapshot
    # do this after the server has started because it will take a while to populate the db from the snapshot,
    # so we might as well be cloning the db instance at the same time, so long is it is available before
    # the server first tries to connect
    db_extra_tags = build_extra_tags(
        event,
        # Turn off overnight, but come back online an hour before the server so db is available
        {"StopAtUTC": "09:00", "StartAtUTC": "18:00"},
    )
    create_db_instance_from_snapshot(
        deployment_name,
        "tupaia",
        clone_db_from,
        db_instance_type,
        extra_tags=db_extra_tags,
        security_group_code=security_group_code,
    )
    # set master password
    set_db_instance_master_password(
        "tupaia-" + deployment_name, get_db_master_password()
    )

    print("Successfully deployed branch " + branch)
