#!/bin/bash
# This script deploys the repositories on startup

# Set PATH to include depencencies
export PATH=/home/ubuntu/.local/bin:/home/ubuntu/.yarn/bin:/home/ubuntu/.config/yarn/global/node_modules/.bin:/home/ubuntu/.nvm/versions/node/v12.18.3/bin:/usr/local/bin:$PATH

# Set the home directory of the user
export HOME_DIRECTORY="/home/ubuntu/tupaia"

DIR=`dirname "$0"`
export STAGE=$(${DIR}/../utility/detectStage.sh)
echo "Starting up instance for ${STAGE}"

# Fetch and deploy the latest for each package based on the stage, including injecting environment
# variables from parameter store into the .env file
${HOME_DIRECTORY}/packages/devops/scripts/deployment/deployLatestRepositories.sh

# Set nginx config and start the service running
${HOME_DIRECTORY}/packages/devops/scripts/deployment/configureNginx.sh


