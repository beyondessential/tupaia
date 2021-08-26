#!/bin/bash
set -x

PACKAGE=$1
DIR=$(dirname "$0")
if [ -f "/root/tupaia_builds/deployment_exists" ]; then
    echo "Deployment for ${CI_BRANCH} exists, updating with latest build"
    DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)
    scp -o StrictHostKeyChecking=no -pr /root/tupaia_builds/${PACKAGE} ubuntu@$DEPLOYMENT_SSH_URL:/home/ubuntu/tupaia_builds
else
    echo "No deployment exists for ${CI_BRANCH}, skipping redeploy"
fi
