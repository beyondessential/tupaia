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
    scp -o StrictHostKeyChecking=no -p /tupaia.tar.gz ubuntu@$DEPLOYMENT_SSH_URL:./tupaia.tar.gz
    ssh -o ServerAliveInterval=15 ubuntu@$DEPLOYMENT_SSH_URL "tar -zxf tupaia.tar.gz && rm tupaia.tar.gz"
else
    echo "No deployment exists for ${CI_BRANCH}, skipping push builds"
fi
