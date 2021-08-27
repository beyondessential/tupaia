#!/bin/bash
set -x

PACKAGE=$1
DIR=$(dirname "$0")
if [ -f "/root/tupaia/deployment_exists" ]; then
    echo "Deployment for ${CI_BRANCH} exists, updating with latest builds"
    DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)
    cd /root && tar -zcvf tupaia.tar.gz tupaia
    scp -o StrictHostKeyChecking=no -p /root/tupaia.tar.gz ubuntu@$DEPLOYMENT_SSH_URL:./tupaia.tar.gz
    ssh -o ServerAliveInterval=15 ubuntu@$DEPLOYMENT_SSH_URL "tar -zxvf tupaia.tar.gz && rm tupaia.tar.gz"
else
    echo "No deployment exists for ${CI_BRANCH}, skipping push builds"
fi
