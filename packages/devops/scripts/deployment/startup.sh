#!/bin/bash
# This script deploys the repositories on startup

# Set PATH to include depencencies
export PATH=/home/ubuntu/.local/bin:/home/ubuntu/.yarn/bin:/home/ubuntu/.config/yarn/global/node_modules/.bin:/home/ubuntu/.nvm/versions/node/v10.15.1/bin:/usr/local/bin:$PATH

# Set the home directory of the user
export HOME_DIRECTORY="/home/ubuntu/tupaia"

# Get the stage tag of this ec2 instance from AWS
TAG_NAME="Stage"
INSTANCE_ID="`wget -qO- http://instance-data/latest/meta-data/instance-id`"
REGION="`wget -qO- http://instance-data/latest/meta-data/placement/availability-zone | sed -e 's:\([0-9][0-9]*\)[a-z]*\$:\\1:'`"
export STAGE="`aws ec2 describe-tags --filters "Name=resource-id,Values=$INSTANCE_ID" "Name=key,Values=$TAG_NAME" --region $REGION --output=text | cut -f5`"

# Fetch and deploy the latest for each package based on the stage, including injecting environment
# variables from parameter store into the .env file
${HOME_DIRECTORY}/packages/devops/scripts/deployment/deployLatestRepositories.sh

# Set nginx config and start the service running
${HOME_DIRECTORY}/packages/devops/scripts/deployment/configureNginx.sh


