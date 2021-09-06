#!/bin/bash
# This script deploys the repositories on startup

# Exit when any command fails
set -e

# Set PATH to include depencencies
export PATH=/home/ubuntu/.local/bin:/home/ubuntu/.yarn/bin:/home/ubuntu/.config/yarn/global/node_modules/.bin:/home/ubuntu/.nvm/versions/node/v12.18.3/bin:/usr/local/bin:$PATH

# Set the home directory of the user
export HOME_DIRECTORY="/home/ubuntu/tupaia"

DIR=$(dirname "$0")
export STAGE=$(${DIR}/../utility/getEC2TagValue.sh Stage)
echo "Starting up instance for ${STAGE}"

# Turn off cloudwatch agent for all except prod and dev (can be turned on manually if needed on feature instances)
if [[ $STAGE != "production" && $STAGE != "dev" ]]; then
    echo "Turning off cloudwatch agent for feature instance."
    echo "To restart, run sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a start"
    sudo amazon-cloudwatch-agent-ctl -m ec2 -a stop
fi

# Set the branch based on STAGE
if [[ $STAGE == "production" ]]; then
    export BRANCH="master"
else
    export BRANCH="$STAGE"
fi

# Fetch the latest code
${HOME_DIRECTORY}/packages/devops/scripts/deployment/checkoutLatest.sh

# Deploy each package based on the stage, including injecting environment variables from parameter
# store into the .env file
${HOME_DIRECTORY}/packages/devops/scripts/deployment/deployPackages.sh

# Set nginx config and start the service running
${HOME_DIRECTORY}/packages/devops/scripts/deployment/configureNginx.sh
