#!/bin/bash
set -x

PACKAGE=$1
DIR=$(dirname "$0")
if [ -f "/common/deployment_exists" ]; then
    echo "Deployment for ${CI_BRANCH} exists, updating with latest changes"
    DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)

    REPLICATION_PM2_CONFIG=''
    if [[ $PACKAGE == "web-config-server" ]]; then
        # as many replicas as cpu cores - 1
        REPLICATION_PM2_CONFIG='-i -1'
    fi
    PM2_START="pm2 start --name ${PACKAGE} dist --wait-ready --listen-timeout 15000 --time ${REPLICATION_PM2_CONFIG}"

    # restart process with latest bundle
    ssh -o ServerAliveInterval=15 ubuntu@$DEPLOYMENT_SSH_URL "cd tupaia/packages/${PACKAGE} && pm2 delete ${PACKAGE} || true && ${PM2_START};"
else
    echo "No deployment exists for ${CI_BRANCH}, skipping redeploy"
fi
