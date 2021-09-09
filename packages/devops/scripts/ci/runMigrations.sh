#!/bin/bash
set -x

DIR=$(dirname "$0")
DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)
DEPLOYMENT_URL=$DEPLOYMENT_SSH_URL # ssh url will resolve to tupaia web frontend desktop over HTTP
if curl --output /dev/null --silent --head --fail $DEPLOYMENT_URL; then
    echo "Deployment for ${CI_BRANCH} exists, running migrations"
    ssh -o ServerAliveInterval=15 ubuntu@$DEPLOYMENT_SSH_URL "cd tupaia; yarn migrate;"
else
    echo "No deployment exists for ${CI_BRANCH}, cancelling update"
fi
