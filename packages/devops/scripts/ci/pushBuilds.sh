#!/bin/bash
set -x

PACKAGE=$1
DIR=$(dirname "$0")
${DIR}/copyFromCommonVolume.sh # pull in .env files and builds from common volume
if [ -f "/common/deployment_exists" ]; then
    echo "Deployment for ${CI_BRANCH} exists, updating with latest builds"
    DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)
    cd /
    tar -zcf tupaia.tar.gz /tupaia
    ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=15 ubuntu@$DEPLOYMENT_SSH_URL "mkdir -p incoming_builds"
    scp -o StrictHostKeyChecking=no -o ServerAliveInterval=15 -p /tupaia.tar.gz ubuntu@$DEPLOYMENT_SSH_URL:./incoming_builds/tupaia.tar.gz
    ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=15 ubuntu@$DEPLOYMENT_SSH_URL "cd incoming_builds && tar -zxf tupaia.tar.gz && cd .. && rm -rf tupaia && mv incoming_builds/tupaia . && rm -rf incoming_builds"
else
    echo "No deployment exists for ${CI_BRANCH}, skipping push builds"
fi
