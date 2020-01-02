#!/bin/bash
DEPLOYMENT_URL=$(${DIR}/determineDeploymentUrl.sh)
if curl --output /dev/null --silent --head --fail $DEPLOYMENT_URL; then
  echo "Deployment for ${CI_BRANCH} exists, updating with latest changes"
  ssh ubuntu@$DEPLOYMENT_URL "cd tupaia/packages/${CI_PACKAGE}; yarn migrate; pm2 restart ${CI_PACKAGE};"
else
  echo "No deployment exists for ${CI_BRANCH}, cancelling update"
fi
