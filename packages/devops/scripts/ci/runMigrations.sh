#!/bin/bash
set -x

DIR=$(dirname "$0")
if [ -f "/root/tupaia/deployment_exists" ]; then
    echo "Deployment for ${CI_BRANCH} exists, running migrations"
    DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)
    ssh -o ServerAliveInterval=15 ubuntu@$DEPLOYMENT_SSH_URL "cd tupaia; yarn migrate;"
else
    echo "No deployment exists for ${CI_BRANCH}, skipping migrations"
fi
