#!/bin/bash
DIR=$(dirname "$0")
DEPLOYMENT_URL=$(${DIR}/determineDeploymentUrl.sh)
if curl --output /dev/null --silent --head --fail $DEPLOYMENT_URL; then
    echo "Unlocking ${CI_BRANCH} for deployments"
    ssh ubuntu@${DEPLOYMENT_URL} "rm /tmp/tupaia-deploy-lock"
fi
