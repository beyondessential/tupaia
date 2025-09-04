#!/bin/bash -leE
# This script gets loaded as "User Data" against the EC2 instance, and deploys the tagged branch
# the first time the instance starts
#
# REMARK
#   The production version of this script lives in the ‘deployment’ Lambda function; simply merging
#   does not deploy code changes to production. To make changes, see
#   https://beyond-essential.slab.com/posts/making-changes-to-deployment-process-9kjpcjic

set -o pipefail # fail pipe where scripts are e.g. piped out to deployment logs

HOME_DIR=/home/ubuntu
TUPAIA_DIR=$HOME_DIR/tupaia
LOGS_DIR=$HOME_DIR/logs
DEPLOYMENT_SCRIPTS=${TUPAIA_DIR}/packages/devops/scripts/deployment-aws

# Add tag for CI/CD to use as a health check
INSTANCE_ID=$(ec2metadata --instance-id)
aws ec2 create-tags --resources ${INSTANCE_ID} --tags Key=StartupBuildProgress,Value=building

# Mark the build progress as errored if anything goes wrong
tag_errored() {
  aws ec2 create-tags --resources ${INSTANCE_ID} --tags Key=StartupBuildProgress,Value=errored
  service nginx stop # stop nginx as an obvious sign the build has failed
}
trap tag_errored ERR

DEPLOYMENT_NAME=$(${DEPLOYMENT_SCRIPTS}/../utility/getEC2TagValue.sh DeploymentName)
BRANCH=$(${DEPLOYMENT_SCRIPTS}/../utility/getEC2TagValue.sh Branch)
echo "Starting up ${DEPLOYMENT_NAME} (${BRANCH})"

# Set bash prompt to have deployment name in it
if [[ $DEPLOYMENT_NAME == "production" ]]; then
  BASH_PROMPT_NAME="PROD"
  BASH_PROMPT_COLOR="31"
else
  BASH_PROMPT_NAME="${DEPLOYMENT_NAME}"
  BASH_PROMPT_COLOR="36"
fi
BASH_PROMPT="\\[\\e]0;\\u@${BASH_PROMPT_NAME}: \\w\\a\\]\\\${debian_chroot:+(\\\$debian_chroot)}\\[\\033[01;32m\\]\\u@\\033[01;${BASH_PROMPT_COLOR}m\\]${BASH_PROMPT_NAME}\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ "
echo "PS1=\"${BASH_PROMPT}\"" >>$HOME_DIR/.bashrc

# Create a directory for logs to go
mkdir -m 777 -p $LOGS_DIR

# Turn on cloudwatch agent for prod and dev (can be turned on manually if needed on feature instances)
# TODO currently broken
# if [[ $DEPLOYMENT_NAME == "production" || $DEPLOYMENT_NAME == "dev" ]]; then
#   $DEPLOYMENT_SCRIPTS/startCloudwatchAgent.sh |& while IFS= read -r line; do echo "$(date) | $line"; done >>$LOGS_DIR/deployment_log.txt
# fi

# Add preaggregation cron job if production
if [[ $DEPLOYMENT_NAME == "production" ]]; then
  \. "$HOME_DIR/.nvm/nvm.sh" # Load nvm so node is available on $PATH
  sudo -u ubuntu echo "10 13 * * * PATH=$PATH $HOME_DIR/tupaia/packages/web-config-server/run_preaggregation.sh | while IFS= read -r line; do echo \"$(date) | $line\"; done > $LOGS_DIR/preaggregation.txt" >tmp.cron
  sudo -u ubuntu crontab -l >>tmp.cron || echo "" >>tmp.cron
  sudo -u ubuntu crontab tmp.cron
  rm tmp.cron
fi

# Fetch the latest code
cd $TUPAIA_DIR
BRANCH_ON_REMOTE=$(sudo -Hu ubuntu git ls-remote --heads origin ${BRANCH})
if [[ $BRANCH_ON_REMOTE == *${BRANCH} ]]; then
  echo "${BRANCH} exists"
  BRANCH_TO_USE=${BRANCH}
else
  echo "${BRANCH} does not exist, defaulting to dev"
  BRANCH_TO_USE="dev"
fi
sudo -Hu ubuntu git remote set-branches --add origin ${BRANCH_TO_USE}
sudo -Hu ubuntu git fetch --all --prune
sudo -Hu ubuntu git reset --hard # clear out any manual changes that have been made, which would cause checkout to fail
sudo -Hu ubuntu git checkout ${BRANCH_TO_USE}
sudo -Hu ubuntu git reset --hard origin/${BRANCH_TO_USE}

startup() {
  # central-server and data-table-server need Tailnet access for external database connections
  sudo -Hu ubuntu DEPLOYMENT_NAME="$deployment_name" "$deployment_scripts"/connectTailscale.sh
  # Build each package, including injecting environment variables from Bitwarden
  sudo -Hu ubuntu "$DEPLOYMENT_SCRIPTS"/buildDeployablePackages.sh "$DEPLOYMENT_NAME"
  # Deploy each package
  sudo -Hu ubuntu "$DEPLOYMENT_SCRIPTS"/../deployment-common/startBackEnds.sh
  # Set nginx config and start the service running
  sudo -E DEPLOYMENT_NAME="$DEPLOYMENT_NAME" "$DEPLOYMENT_SCRIPTS"/configureNginx.sh
}

startup |&
  while IFS= read -r line; do
    echo "$(date) | $line"
  done >>$LOGS_DIR/deployment_log.txt

# Tag as complete so CI/CD system can use the tag as a health check
aws ec2 create-tags --resources ${INSTANCE_ID} --tags Key=StartupBuildProgress,Value=complete
