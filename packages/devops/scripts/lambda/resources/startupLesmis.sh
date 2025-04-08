#!/bin/bash -leE
# This script gets loaded as "User Data" against the EC2 instance, and deploys the tagged branch
# the first time the instance starts

set -o pipefail # fail pipe where scripts are e.g. piped out to deployment logs

HOME_DIR=/home/ubuntu

# Add tag for CI/CD to use as a health check
INSTANCE_ID=$(ec2metadata --instance-id)
aws ec2 create-tags --resources ${INSTANCE_ID} --tags Key=StartupBuildProgress,Value=building

# Mark the build progress as errored if anything goes wrong
tag_errored() {
  aws ec2 create-tags --resources ${INSTANCE_ID} --tags Key=StartupBuildProgress,Value=errored
  service nginx stop # stop nginx as an obvious sign the build has failed
}
trap tag_errored ERR

cd $HOME_DIR
sudo -Hu ubuntu git clone https://github.com/beyondessential/tupaia.git

TUPAIA_DIR=$HOME_DIR/tupaia
LOGS_DIR=$HOME_DIR/logs
DEPLOYMENT_SCRIPTS=${TUPAIA_DIR}/packages/devops/scripts
AWS_DEPLOYMENT_SCRIPTS=${DEPLOYMENT_SCRIPTS}/deployment-aws

DEPLOYMENT_NAME=$(${AWS_DEPLOYMENT_SCRIPTS}/../utility/getEC2TagValue.sh DeploymentName)
BRANCH=$(${AWS_DEPLOYMENT_SCRIPTS}/../utility/getEC2TagValue.sh Branch)
DB_DUMP_FILE=$(${AWS_DEPLOYMENT_SCRIPTS}/../utility/getEC2TagValue.sh DbDumpFile)
SUBDOMAINS=$(${AWS_DEPLOYMENT_SCRIPTS}/../utility/getEC2TagValue.sh SubdomainsViaDns)
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

export DOMAIN=tupaia.org
export DEFAULT_FRONTEND=lesmis
export GIT_REPO=https://github.com/beyondessential/tupaia.git
export GIT_BRANCH=$BRANCH
export DEPLOYMENT_NAME=$DEPLOYMENT_NAME
export USE_SSL=true

export BW_CLIENTID=$("$AWS_DEPLOYMENT_SCRIPTS/fetchParameterStoreValue.sh" BW_CLIENTID)
export BW_CLIENTSECRET=$("$AWS_DEPLOYMENT_SCRIPTS/fetchParameterStoreValue.sh" BW_CLIENTSECRET)
export BW_PASSWORD=$("$AWS_DEPLOYMENT_SCRIPTS/fetchParameterStoreValue.sh" BW_PASSWORD)
DB_DUMP=$HOME_DIR/dump.sql

sudo -E -Hu ubuntu $AWS_DEPLOYMENT_SCRIPTS/downloadFromS3.sh $DB_DUMP_FILE $DB_DUMP.gz && sudo -E -Hu ubuntu gunzip $DB_DUMP.gz &>/home/ubuntu/logs/download_db.log
sudo -E -Hu ubuntu $DEPLOYMENT_SCRIPTS/deployment-aws/setupSslCertificate.sh $DEPLOYMENT_NAME $DOMAIN $SUBDOMAINS &>/home/ubuntu/logs/setup_ssl_cert.log
sudo -E -Hu ubuntu $DEPLOYMENT_SCRIPTS/deployment-vm-app/setup.sh &>/home/ubuntu/logs/setup_app.log
sudo -E -Hu ubuntu $DEPLOYMENT_SCRIPTS/deployment-vm-db/setup.sh &>/home/ubuntu/logs/setup_db.log
sudo -E -Hu ubuntu $DEPLOYMENT_SCRIPTS/deployment-vm-app/install.sh &>/home/ubuntu/logs/install_app.log
sudo -E -Hu ubuntu $DEPLOYMENT_SCRIPTS/deployment-vm-db/initialiseDatabase.sh &>/home/ubuntu/logs/initialise_db.log
sudo -E -Hu ubuntu $DEPLOYMENT_SCRIPTS/deployment-vm-db/importDbDump.sh $DB_DUMP &>/home/ubuntu/logs/import_db.log

# Tag as complete so CI/CD system can use the tag as a health check
aws ec2 create-tags --resources ${INSTANCE_ID} --tags Key=StartupBuildProgress,Value=complete
