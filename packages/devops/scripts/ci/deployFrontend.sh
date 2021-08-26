#!/bin/bash
set -x

PACKAGE=$1
DIR=$(dirname "$0")
DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)
if [ -f "${DIR}/tamanu_builds/deployment_exists" ]; then
    echo "Deployment for ${CI_BRANCH} exists, updating with latest build"
    scp ./tupaia_builds/${PACKAGE} ubuntu@$DEPLOYMENT_SSH_URL:/tupaia/packages/${PACKAGE}/served_build
else
    echo "No deployment exists for ${CI_BRANCH}, cancelling update"
fi
