#!/bin/bash
PACKAGE=$1
DIR=$(dirname "$0")
DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)
if curl --output /dev/null --silent --head --fail DEPLOYMENT_SSH_URL; then
    echo "Deployment for ${CI_BRANCH} exists, updating with latest changes"
    ssh -o ServerAliveInterval=15 ubuntu@DEPLOYMENT_SSH_URL "cd tupaia; yarn workspace @tupaia/${PACKAGE} build"
else
    echo "No deployment exists for ${CI_BRANCH}, cancelling update"
fi
