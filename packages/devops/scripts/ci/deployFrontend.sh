#!/bin/bash
set -x

PACKAGE=$1
DIR=$(dirname "$0")
DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)
if [ -f "/root/tupaia_builds/deployment_exists" ]; then
    echo "Deployment for ${CI_BRANCH} exists, updating with latest build"
    scp -o StrictHostKeyChecking=no -r /root/tupaia_builds/${PACKAGE} ubuntu@$DEPLOYMENT_SSH_URL:/tupaia/packages/${PACKAGE}
else
    echo "No deployment exists for ${CI_BRANCH}, cancelling update"
fi
