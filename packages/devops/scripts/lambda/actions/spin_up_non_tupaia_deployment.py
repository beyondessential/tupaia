from helpers.clone import *

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

    if 'Subdomains' not in event:
        raise Exception('You must include the key "Subdomains" in the lambda config, indicating what subdomain of tupaia.org this instance should be available at')
    subdomains = event['Subdomains']
    subdomains_plus_ssh = [subdomain + '-ssh' for subdomain in subdomains]

    # set up aws account to execute under
    account_ids = get_account_ids()
    clone_from_stage = event.get('CloneFromStage', 'production') # default to cloning production
    clone_instance(account_ids, deployment_code, clone_from_stage, branch, instance_type, subdomains_via_gateway=subdomains, subdomains_via_dns=subdomains_plus_ssh)

    print('Deployment cloned')
