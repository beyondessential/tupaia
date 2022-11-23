#!/bin/bash -xe

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"

APP_SERVER_HOST=${1?Argument 1 - APP_SERVER_HOST required.}
APP_SERVER_SSH_KEY=${2?Argument 2 - APP_SERVER_SSH_KEY required.}
APP_SERVER_PORT=${3?Argument 3 - APP_SERVER_PORT required.}

# Upload files
./upload.sh $APP_SERVER_HOST $APP_SERVER_SSH_KEY $APP_SERVER_PORT

# Setup machine
ssh -i $APP_SERVER_SSH_KEY -p $APP_SERVER_PORT ubuntu@$APP_SERVER_HOST 'bash -l /home/ubuntu/deployment/setup.sh > "/home/ubuntu/logs/setup_"$(date +"%Y-%m-%d:%H-%M-%S")".log"'

# Install tupaia
ssh -i $APP_SERVER_SSH_KEY -p $APP_SERVER_PORT ubuntu@$APP_SERVER_HOST 'bash -l /home/ubuntu/deployment/install.sh > "/home/ubuntu/logs/install_"$(date +"%Y-%m-%d:%H-%M-%S")".log"'

# Start tupaia
# ssh -i $APP_SERVER_SSH_KEY -p $APP_SERVER_PORT ubuntu@$APP_SERVER_HOST 'bash -l /home/ubuntu/deployment/start.sh > "/home/ubuntu/logs/start_"$(date +"%Y-%m-%d:%H-%M-%S")".log"'

echo "Deployed"