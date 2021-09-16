#!/bin/bash -e

DIR=$(dirname "$0")
DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)
if curl --output /dev/null --silent --head --fail $DEPLOYMENT_SSH_URL; then
  touch /common/deployment_exists
fi
