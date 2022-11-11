#!/bin/bash -xe

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"

APP_SERVER_HOST=${1?Argument 1 - APP_SERVER_HOST required.}
APP_SERVER_SSH_KEY=${2?Argument 2 - APP_SERVER_SSH_KEY required.}

# Upload files
./upload-vm-app.sh $APP_SERVER_HOST $APP_SERVER_SSH_KEY

# Setup machine
ssh -i $APP_SERVER_SSH_KEY ubuntu@$APP_SERVER_HOST 'bash -l /home/ubuntu/deployment/setup.sh > "/home/ubuntu/logs/setup_"$(date +"%Y-%m-%d:%H-%M-%S")".log"'

# Install tupaia
ssh -i $APP_SERVER_SSH_KEY ubuntu@$APP_SERVER_HOST 'bash -l /home/ubuntu/deployment/install.sh > "/home/ubuntu/logs/install_"$(date +"%Y-%m-%d:%H-%M-%S")".log"'

# Start tupaia
# ssh -i $APP_SERVER_SSH_KEY ubuntu@$APP_SERVER_HOST 'bash -l /home/ubuntu/deployment/start.sh > "/home/ubuntu/logs/start_"$(date +"%Y-%m-%d:%H-%M-%S")".log"'

echo "Deployed"