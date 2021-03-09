#!/bin/bash
PACKAGE=$1
DIR=$(dirname "$0")
DEPLOYMENT_URL=$(${DIR}/determineDeploymentUrl.sh)
if curl --output /dev/null --silent --head --fail $DEPLOYMENT_URL; then
    echo "Deployment for ${CI_BRANCH} exists, updating with latest changes"
    ssh ubuntu@$DEPLOYMENT_URL "cd tupaia && yarn workspace @tupaia/${PACKAGE} build && pm2 delete ${PACKAGE} && pm2 start --name $PACKAGE dist --wait-ready --listen-timeout 15000 --time;"
else
    echo "No deployment exists for ${CI_BRANCH}, cancelling update"
fi
