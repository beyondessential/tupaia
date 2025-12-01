from actions.backup_instances import backup_instances
from actions.delete_old_databases import delete_old_databases
from actions.delete_old_servers import delete_old_servers
from actions.delete_old_snapshots import delete_old_snapshots
from actions.redeploy_tupaia_server import redeploy_tupaia_server
from actions.refresh_cloned_databases import refresh_cloned_databases
from actions.refresh_cloned_servers import refresh_cloned_servers
from actions.spin_up_dhis_deployment import spin_up_dhis_deployment
from actions.spin_up_lesmis_deployment import spin_up_lesmis_deployment
from actions.spin_up_tupaia_database import spin_up_tupaia_database
from actions.spin_up_tupaia_deployment import spin_up_tupaia_deployment
from actions.start_tagged_databases import start_tagged_databases
from actions.start_tagged_servers import start_tagged_servers
from actions.stop_tagged_databases import stop_tagged_databases
from actions.stop_tagged_servers import stop_tagged_servers
from actions.swap_out_tupaia_server import swap_out_tupaia_server
from actions.tear_down_dhis_deployment import tear_down_dhis_deployment
from actions.tear_down_lesmis_deployment import tear_down_lesmis_deployment
from actions.tear_down_tupaia_deployment import tear_down_tupaia_deployment

actions = {
    "backup_instances": backup_instances,
    "delete_old_databases": delete_old_databases,
    "delete_old_servers": delete_old_servers,
    "delete_old_snapshots": delete_old_snapshots,
    "redeploy_tupaia_server": redeploy_tupaia_server,
    "refresh_cloned_databases": refresh_cloned_databases,
    "refresh_cloned_servers": refresh_cloned_servers,
    "spin_up_dhis_deployment": spin_up_dhis_deployment,
    "spin_up_lesmis_deployment": spin_up_lesmis_deployment,
    "spin_up_tupaia_database": spin_up_tupaia_database,
    "spin_up_tupaia_deployment": spin_up_tupaia_deployment,
    "start_tagged_databases": start_tagged_databases,
    "start_tagged_servers": start_tagged_servers,
    "stop_tagged_databases": stop_tagged_databases,
    "stop_tagged_servers": stop_tagged_servers,
    "swap_out_tupaia_server": swap_out_tupaia_server,
    "tear_down_dhis_deployment": tear_down_dhis_deployment,
    "tear_down_lesmis_deployment": tear_down_lesmis_deployment,
    "tear_down_tupaia_deployment": tear_down_tupaia_deployment,
}


def lambda_handler(event, context):
    if "Action" not in event:
        raise Exception(
            'Must provide "Action" in the lambda config to tell it what to do. Supported actions are '
            + ", ".join(actions.keys())
        )

    action = event["Action"]

    if "User" not in event:
        raise Exception(
            'Must provide your AWS username under the key "User" in the lambda config'
        )

    user = event["User"]

    if action not in actions:
        raise Exception("Action must be one of " + ", ".join(actions.keys()))

    action_handler = actions[action]

    print(user + " triggered " + action)

    return action_handler(event)
