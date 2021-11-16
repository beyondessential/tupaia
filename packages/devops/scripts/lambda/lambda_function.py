from actions.backup_instances import backup_instances
from actions.delete_old_deployments import delete_old_deployments
from actions.delete_old_snapshots import delete_old_snapshots
from actions.refresh_cloned_instances import refresh_cloned_instances
from actions.redeploy_tupaia_server import redeploy_tupaia_server
from actions.spin_up_dhis_deployment import spin_up_dhis_deployment
from actions.spin_up_tupaia_deployment import spin_up_tupaia_deployment
from actions.start_tagged_instances import start_tagged_instances
from actions.stop_tagged_instances import stop_tagged_instances
from actions.swap_out_tupaia_server import swap_out_tupaia_server
from actions.tear_down_tupaia_deployment import tear_down_tupaia_deployment
from actions.tear_down_dhis_deployment import tear_down_dhis_deployment

actions = {
  'backup_instances': backup_instances,
  'delete_old_deployments': delete_old_deployments,
  'delete_old_snapshots': delete_old_snapshots,
  'refresh_cloned_instances': refresh_cloned_instances,
  'redeploy_tupaia_server': redeploy_tupaia_server,
  'spin_up_dhis_deployment': spin_up_dhis_deployment,
  'spin_up_tupaia_deployment': spin_up_tupaia_deployment,
  'start_tagged_instances': start_tagged_instances,
  'stop_tagged_instances': stop_tagged_instances,
  'swap_out_tupaia_server': swap_out_tupaia_server,
  'tear_down_tupaia_deployment': tear_down_tupaia_deployment,
  'tear_down_dhis_deployment': tear_down_dhis_deployment,
}

def lambda_handler(event, context):
    if 'Action' not in event:
      raise Exception('Must provide "Action" in the lambda config to tell it what to do. Supported actions are ' + ', '.join(actions.keys()))

    action = event['Action']

    if 'User' not in event:
      raise Exception('Must provide your AWS username under the key "User" in the lambda config')

    user = event['User']

    if action not in actions:
      raise Exception('Action must be one of ' + ', '.join(actions.keys()))

    action_handler = actions[action]

    print(user + ' triggered ' + action)

    return action_handler(event)
