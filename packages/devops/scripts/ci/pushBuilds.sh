#!/bin/bash -e
set -x

PACKAGE=$1
DIR=$(dirname "$0")
INCOMING_BUILDS_FOLDER="incoming_builds_${CI_STRING_TIME}"
${DIR}/copyFromCommonVolume.sh # pull in .env files and builds from common volume
if [ -f "/common/deployment_exists" ]; then
    echo "Deployment for ${CI_BRANCH} exists, updating with latest builds"
    DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)
    cd /
    tar -zcf tupaia.tar.gz /tupaia
    ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=15 ubuntu@$DEPLOYMENT_SSH_URL "mkdir -p ${INCOMING_BUILDS_FOLDER}"
    scp -o StrictHostKeyChecking=no -o ServerAliveInterval=15 -p /tupaia.tar.gz ubuntu@$DEPLOYMENT_SSH_URL:./${INCOMING_BUILDS_FOLDER}/tupaia.tar.gz
    ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=15 ubuntu@$DEPLOYMENT_SSH_URL "cd ${INCOMING_BUILDS_FOLDER} && tar -zxf tupaia.tar.gz && cd .. && rm -rf tupaia && mv ${INCOMING_BUILDS_FOLDER}/tupaia . && rm -rf ${INCOMING_BUILDS_FOLDER}"
else
    echo "No deployment exists for ${CI_BRANCH}, skipping push builds"
fi
