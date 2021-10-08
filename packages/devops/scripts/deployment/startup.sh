#!/bin/bash -le
# This script deploys the repositories on startup

# Set the home directory of the user
export HOME_DIRECTORY="/home/ubuntu/tupaia"

DIR=$(dirname "$0")
export STAGE=$(${DIR}/../utility/getEC2TagValue.sh Stage)
echo "Starting up instance for ${STAGE}"

# Turn on cloudwatch agent for prod and dev (can be turned on manually if needed on feature instances)
if [[ $STAGE == "production" || $STAGE == "dev" ]]; then
    ${HOME_DIRECTORY}/packages/devops/scripts/deployment/startCloudwatchAgent.sh
fi

# Set the branch based on STAGE
if [[ $STAGE == "production" ]]; then
    export BRANCH="master"
else
    export BRANCH="$STAGE"
fi

# Fetch the latest code
${HOME_DIRECTORY}/packages/devops/scripts/deployment/checkoutLatest.sh

# Deploy each package based on the stage, including injecting environment variables from LastPass
# store into the .env file
${HOME_DIRECTORY}/packages/devops/scripts/deployment/deployPackages.sh

# Set nginx config and start the service running
${HOME_DIRECTORY}/packages/devops/scripts/deployment/configureNginx.sh
