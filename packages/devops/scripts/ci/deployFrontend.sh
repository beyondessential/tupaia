#!/bin/bash
set -x

PACKAGE=$1
DIR=$(dirname "$0")
if [ -f "/root/tupaia_builds/deployment_exists" ]; then
    echo "Deployment for ${CI_BRANCH} exists, updating with latest build"
    DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)
    cd /root/tupaia_builds && tar -zcvf ${PACKAGE}.tar.gz ${PACKAGE} && cd ..
    scp -o StrictHostKeyChecking=no /root/tupaia_builds/${PACKAGE}.tar.gz ubuntu@$DEPLOYMENT_SSH_URL:/home/ubuntu/tupaia_builds
    ssh -o ServerAliveInterval=15 ubuntu@$DEPLOYMENT_SSH_URL "cd tupaia_builds && rm -rf ${PACKAGE} && tar -zxvf ${PACKAGE}.tar.gz && rm ${PACKAGE}.tar.gz"
else
    echo "No deployment exists for ${CI_BRANCH}, skipping redeploy"
fi
