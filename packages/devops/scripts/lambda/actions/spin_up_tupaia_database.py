"""
Creates a new Tupaia database instance

Example configs

1. Spin up a new database instance
{
  "Action": "spin_up_tupaia_database",
  "User": "rohan",
  "DeploymentName": "rn-195-epic",
  "CloneDbFrom": "dev",
  "DbInstanceType": "db.t4g.medium"
}
"""

from helpers.creation import create_db_instance_from_snapshot
from helpers.rds import set_db_instance_master_password
from helpers.secrets import get_db_master_password
from helpers.utilities import build_extra_tags


def spin_up_tupaia_database(event):
    # validate input config
    if "DeploymentName" not in event:
        raise Exception(
            'You must include the key "DeploymentName" in the lambda config, e.g. "dev".'
        )
    deployment_name = event["DeploymentName"]

    # get manual input parameters, or default for any not provided
    db_instance_type = event.get("DbInstanceType", "db.t4g.large")
    # Use security group tagged with code
    security_group_code = event.get("SecurityGroupCode", "tupaia-dev-sg")
    # Use volume snapshot tagged with deployment name
    clone_db_from = event.get("CloneDbFrom", "production")
    extra_tags = build_extra_tags(
        event,
        # Turn off overnight, but come back online an hour before the server so db is available
        {"StopAtUTC": "09:00", "StartAtUTC": "18:00"},
    )

    # create db instance from a snapshot
    create_db_instance_from_snapshot(
        deployment_name,
        "tupaia",
        clone_db_from,
        db_instance_type,
        extra_tags=extra_tags,
        security_group_code=security_group_code,
    )

    # set master password
    set_db_instance_master_password(
        "tupaia-" + deployment_name, get_db_master_password()
    )
