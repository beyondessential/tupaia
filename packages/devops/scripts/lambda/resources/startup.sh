#!/bin/bash -le
# This script gets loaded as "User Data" against the EC2 instance, and deploys the tagged branch
# the first time the instance starts

HOME_DIR=/home/ubuntu
TUPAIA_DIR=$HOME_DIR/tupaia
LOGS_DIR=$HOME_DIR/logs
DEPLOYMENT_SCRIPTS=${TUPAIA_DIR}/packages/devops/scripts/deployment

# Add tag for CI/CD to use as a health check
INSTANCE_ID=$(ec2metadata --instance-id)
aws ec2 create-tags --resources ${INSTANCE_ID} --tags Key=StartupBuildProgress,Value=building

DEPLOYMENT_NAME=$(${DEPLOYMENT_SCRIPTS}/../utility/getEC2TagValue.sh DeploymentName)
BRANCH=$(${DEPLOYMENT_SCRIPTS}/../utility/getEC2TagValue.sh Branch)
echo "Starting up ${DEPLOYMENT_NAME} (${BRANCH})"

# Create a directory for logs to go
mkdir $LOGS_DIR

# Turn on cloudwatch agent for prod and dev (can be turned on manually if needed on feature instances)
if [[ $DEPLOYMENT_NAME == "production" || $DEPLOYMENT_NAME == "dev" ]]; then
    $DEPLOYMENT_SCRIPTS/startCloudwatchAgent.sh | while IFS= read -r line; do printf '\%s \%s\n' "$(date)" "$line"; done  >> $LOGS_DIR/deployment_log.txt
fi

# Add preaggregation cron job if production
if [[ $DEPLOYMENT_NAME == "production" ]]; then
  set +e # Temporarily allow non 0 exit, as crontab probably doesn't exist yet
  (crontab -l ; echo "10 13 * * * /home/ubuntu/tupaia/packages/web-config-server/run_preaggregation.sh | while IFS= read -r line; do printf '\%s \%s\n' "$(date)" "$line"; done > /home/ubuntu/logs/preaggregation.txt") | crontab -
  set -e
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

# Deploy each package, including injecting environment variables from LastPass
sudo -Hu ubuntu $DEPLOYMENT_SCRIPTS/buildDeployablePackages.sh $DEPLOYMENT_NAME | while IFS= read -r line; do printf '\%s \%s\n' "$(date)" "$line"; done  >> $LOGS_DIR/deployment_log.txt
sudo -Hu ubuntu $DEPLOYMENT_SCRIPTS/startBackEnds.sh | while IFS= read -r line; do printf '\%s \%s\n' "$(date)" "$line"; done  >> $LOGS_DIR/deployment_log.txt

# Set nginx config and start the service running
$DEPLOYMENT_SCRIPTS/configureNginx.sh | while IFS= read -r line; do printf '\%s \%s\n' "$(date)" "$line"; done  >> $LOGS_DIR/deployment_log.txt

# Tag as complete so CI/CD system can use the tag as a health check
aws ec2 create-tags --resources ${INSTANCE_ID} --tags Key=StartupBuildProgress,Value=complete
