from helpers.clone import clone_instance

# Used for cloning a deployment of DHIS2 or another EC2 instance

def spin_up_non_tupaia_deployment(event):
    # validate input config
    if 'DeploymentCode' not in event:
        raise Exception('You must include the key "DeploymentCode" in the lambda config to indicate which database snapshot to use.')
    deployment_code = event['DeploymentCode']

    if 'Branch' not in event:
        raise Exception('You must include the key "Branch" in the lambda config, e.g. "dev".')
    branch = event['Branch']

    if 'InstanceType' not in event:
        raise Exception('You must include the key "InstanceType" in the lambda config. We recommend "t3a.medium" unless you need more speed.')
    instance_type = event['InstanceType']

    clone_from_stage = event.get('CloneFromStage', 'production') # default to cloning production
    clone_instance(deployment_code, clone_from_stage, branch, instance_type)

    print('Deployment cloned')
