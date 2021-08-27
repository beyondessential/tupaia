#!/bin/bash
set -x

PACKAGE=$1
DIR=$(dirname "$0")
if [ -f "/root/tupaia/deployment_exists" ]; then
    echo "Deployment for ${CI_BRANCH} exists, updating with latest builds"
    DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)
    cd /root && tar -zcvf tupaia.tar.gz tupaia
    scp -o StrictHostKeyChecking=no -p /root/tupaia.tar.gz ubuntu@$DEPLOYMENT_SSH_URL:/_incoming_build
    ssh -o ServerAliveInterval=15 ubuntu@$DEPLOYMENT_SSH_URL "cd _incoming_build && tar -zxvf tupaia.tar.gz && rm tupaia.tar.gz && cd .. && rm -rf tupaia && mv _incoming_build/tupaia . && rm -rf _incoming_build"
else
    echo "No deployment exists for ${CI_BRANCH}, skipping push builds"
fi
