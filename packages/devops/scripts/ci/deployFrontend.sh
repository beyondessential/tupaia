#!/bin/bash
set -x

PACKAGE=$1
DIR=$(dirname "$0")
DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)
DEPLOYMENT_URL=$DEPLOYMENT_SSH_URL # ssh url will resolve to tupaia web frontend desktop over HTTP
if curl --output /dev/null --silent --head --fail $DEPLOYMENT_URL; then
    echo "Deployment for ${CI_BRANCH} exists, updating with latest changes"

    echo "Pulling environment variables"
    echo "${LASTPASS_PASSWORD}" | lpass login ${LASTPASS_EMAIL}
    lpass show --notes ${PACKAGE}.dev.env > ./packages/${PACKAGE}/.env

    echo "Building"
    yarn workspace @tupaia/${PACKAGE} build

    echo "Pushing"
    scp ./packages/${PACKAGE}/served_build ubuntu@$DEPLOYMENT_SSH_URL:/tupaia/packages/${PACKAGE}/served_build
else
    echo "No deployment exists for ${CI_BRANCH}, cancelling update"
fi
