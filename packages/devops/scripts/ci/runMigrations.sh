#!/bin/bash
DIR=$(dirname "$0")
DEPLOYMENT_URL=$(${DIR}/determineDeploymentUrl.sh)
if curl --output /dev/null --silent --head --fail $DEPLOYMENT_URL; then
  echo "Deployment for ${CI_BRANCH} exists, running migrations"
  ssh ubuntu@$DEPLOYMENT_URL "cd tupaia; yarn migrate;"
else
  echo "No deployment exists for ${CI_BRANCH}, cancelling update"
fi
