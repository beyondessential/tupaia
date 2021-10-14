#!/bin/bash -le
# This script deploys the repositories on startup

export HOME=/home/ubuntu
TUPAIA_DIR=$HOME/tupaia
LOGS_DIR=$HOME/logs
DEPLOYMENT_SCRIPTS=${TUPAIA_DIR}/packages/devops/scripts/deployment
STAGE=$(${DEPLOYMENT_SCRIPTS}/../utility/getEC2TagValue.sh Stage)
echo "Starting up instance for ${STAGE}"

# Create a directory for logs to go
mkdir $LOGS_DIR

# Set the branch based on STAGE
if [[ $STAGE == "production" ]]; then
    BRANCH="master"
else
    BRANCH="$STAGE"
fi

# Turn on cloudwatch agent for prod and dev (can be turned on manually if needed on feature instances)
if [[ $BRANCH == "master" || $BRANCH == "dev" ]]; then
    $DEPLOYMENT_SCRIPTS/startCloudwatchAgent.sh | while IFS= read -r line; do printf '\%s \%s\n' "$(date)" "$line"; done  >> $LOGS_DIR/deployment_log.txt
fi

# Fetch the latest code
cd $TUPAIA_DIR
BRANCH_ON_REMOTE=$(git ls-remote --heads origin ${BRANCH})
if [[ $BRANCH_ON_REMOTE == *${BRANCH} ]]; then
  echo "${BRANCH} exists"
  BRANCH_TO_USE=${BRANCH}
else
  echo "${BRANCH} does not exist, defaulting to dev"
  BRANCH_TO_USE="dev"
fi
git remote set-branches --add origin ${BRANCH_TO_USE}
git fetch --all --prune
git reset --hard # clear out any manual changes that have been made, which would cause checkout to fail
git checkout ${BRANCH_TO_USE}
git reset --hard origin/${BRANCH_TO_USE}

# Deploy each package based on the branch, including injecting environment variables from LastPass
sudo -u ubuntu $DEPLOYMENT_SCRIPTS/deployPackages.sh $BRANCH | while IFS= read -r line; do printf '\%s \%s\n' "$(date)" "$line"; done  >> $LOGS_DIR/deployment_log.txt

# Set nginx config and start the service running
$DEPLOYMENT_SCRIPTS/configureNginx.sh | while IFS= read -r line; do printf '\%s \%s\n' "$(date)" "$line"; done  >> $LOGS_DIR/deployment_log.txt
