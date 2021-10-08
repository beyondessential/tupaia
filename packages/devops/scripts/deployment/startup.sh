#!/bin/bash -le
# This script deploys the repositories on startup

DIR=$(dirname "$0")
TUPAIA_DIR=$DIR/../../../..
STAGE=$(${DIR}/../utility/getEC2TagValue.sh Stage)
echo "Starting up instance for ${STAGE}"

# Turn on cloudwatch agent for prod and dev (can be turned on manually if needed on feature instances)
if [[ $STAGE == "production" || $STAGE == "dev" ]]; then
    ${TUPAIA_DIR}/packages/devops/scripts/deployment/startCloudwatchAgent.sh
fi

# Set the branch based on STAGE
if [[ $STAGE == "production" ]]; then
    BRANCH="master"
else
    BRANCH="$STAGE"
fi

# Fetch the latest code
sudo -u ubuntu ${TUPAIA_DIR}/packages/devops/scripts/deployment/checkoutLatest.sh $BRANCH

# Deploy each package based on the stage, including injecting environment variables from LastPass
# store into the .env file
sudo -u ubuntu ${TUPAIA_DIR}/packages/devops/scripts/deployment/deployPackages.sh $BRANCH

# Set nginx config and start the service running
${TUPAIA_DIR}/packages/devops/scripts/deployment/configureNginx.sh
