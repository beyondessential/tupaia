#!/bin/bash
PACKAGE=$1
DIR=$(dirname "$0")
DEPLOYMENT_URL=$(${DIR}/determineDeploymentUrl.sh)
if curl --output /dev/null --silent --head --fail $DEPLOYMENT_URL; then
    echo "Deployment for ${CI_BRANCH} exists, running e2e tests"
    ssh ubuntu@$DEPLOYMENT_URL "cd tupaia && yarn workspace @tupaia/${PACKAGE} test-e2e --ciBuildId ${CI_BUILD_ID}"
else
    echo "No deployment exists for ${CI_BRANCH}, skipping e2e tests"
    exit 1
fi
