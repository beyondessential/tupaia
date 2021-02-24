#!/bin/bash
PACKAGE=$1
DIR=$(dirname "$0")
DEPLOYMENT_URL=$(${DIR}/determineDeploymentUrl.sh)
if curl --output /dev/null --silent --head --fail $DEPLOYMENT_URL; then
    echo "Deployment for ${CI_BRANCH} exists, running e2e tests"
    CYPRESS_BASE_URL="https://${DEPLOYMENT_URL}"
    ssh ubuntu@$DEPLOYMENT_URL "cd tupaia && CYPRESS_BASE_URL=${CYPRESS_BASE_URL} yarn workspace @tupaia/${PACKAGE} test-e2e"
else
    echo "No deployment exists for ${CI_BRANCH}, skipping e2e tests"
    exit 1
fi
