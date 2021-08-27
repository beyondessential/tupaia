#!/bin/bash
set -x

PACKAGE=$1
DIR=$(dirname "$0")
if [ -f "/root/tupaia_builds/deployment_exists" ]; then
    echo "Deployment for ${CI_BRANCH} exists, updating with latest changes"
    DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)

    REPLICATION_PM2_CONFIG=''
    if [[ $PACKAGE == "web-config-server" ]]; then
        # as many replicas as cpu cores - 1
        REPLICATION_PM2_CONFIG='-i -1'
    fi
    PM2_START="pm2 start --name ${PACKAGE} dist --wait-ready --listen-timeout 15000 --time ${REPLICATION_PM2_CONFIG}"

    # push bundle to host
    cd /root/tupaia_builds && tar -zcvf ${PACKAGE}.tar.gz ${PACKAGE}
    scp -o StrictHostKeyChecking=no /root/tupaia_builds/${PACKAGE}.tar.gz ubuntu@$DEPLOYMENT_SSH_URL:/home/ubuntu/tupaia_builds
    ssh -o ServerAliveInterval=15 ubuntu@$DEPLOYMENT_SSH_URL "cd tupaia_builds && rm -rf ${PACKAGE} && tar -zxvf ${PACKAGE}.tar.gz && rm ${PACKAGE}.tar.gz"

    # restart process with latest bundle
    ssh -o ServerAliveInterval=15 ubuntu@$DEPLOYMENT_SSH_URL "cd tupaia_builds/${PACKAGE} && pm2 delete ${PACKAGE} || true && ${PM2_START};"
else
    echo "No deployment exists for ${CI_BRANCH}, skipping redeploy"
fi
