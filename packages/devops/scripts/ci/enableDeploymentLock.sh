#!/bin/bash
DIR=$(dirname "$0")
DEPLOYMENT_URL=$(${DIR}/determineDeploymentUrl.sh)
if curl --output /dev/null --silent --head --fail $DEPLOYMENT_URL; then
    echo "Locking ${CI_BRANCH} for deployments"
    ssh ubuntu@${DEPLOYMENT_URL} "
    test -e /tmp/tupaia-deploy-lock
    echo LOCKED
    touch /tmp/tupaia-deploy-lock
    "
fi