# Creates a new RDS instance with an installed Tupaia database cloned from an existing snapshot
#
# {
#   "Action": "tear_down_rds_deployment",
#   "User": "rohan",
#   "Snapshot": "production"
# }

from helpers.rds import delete_db_instance

def tear_down_rds_deployment(event):
    # validate input config
    if 'DeploymentName' not in event:
        raise Exception('You must include the key "DeploymentName" in the lambda config, e.g. "dev".')
    deployment_name = event['DeploymentName']

    # find current instances
    # TODO: Check to ensure there's no existing instances

    # clone db instance
    # do this after the server has started because it will take a while to run its startup script, so
    # we might as well be cloning the db instance at the same time, so long is it is available before
    # the server first tries to connect
    instance = delete_db_instance(
        deployment_name
    )

    print('Successfully deleted RDS instance')
