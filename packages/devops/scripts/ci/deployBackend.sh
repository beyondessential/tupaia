#!/bin/bash
set -x

PACKAGE=$1
DIR=$(dirname "$0")
DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)
DEPLOYMENT_URL=$DEPLOYMENT_SSH_URL # ssh url will resolve to tupaia web frontend desktop over HTTP
if curl --output /dev/null --silent --head --fail $DEPLOYMENT_URL; then
    echo "Deployment for ${CI_BRANCH} exists, updating with latest changes"
    ssh -o ServerAliveInterval=15 ubuntu@$DEPLOYMENT_SSH_URL "cd tupaia/packages/${PACKAGE} && yarn build && pm2 delete ${PACKAGE} || true && pm2 start --name ${PACKAGE} dist --wait-ready --listen-timeout 15000 --time;"
else
    echo "No deployment exists for ${CI_BRANCH}, cancelling update"
fi
