#!/bin/bash -xe

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"

APP_SERVER_HOST=${1?Argument 1 - APP_SERVER_HOST required.}
APP_SERVER_SSH_KEY=${2?Argument 2 - APP_SERVER_SSH_KEY required.}

# Make dirs
ssh -i $APP_SERVER_SSH_KEY ubuntu@$APP_SERVER_HOST 'mkdir -p /home/ubuntu/deployment/'
ssh -i $APP_SERVER_SSH_KEY ubuntu@$APP_SERVER_HOST 'mkdir -p /home/ubuntu/configs/'

# Copy files up
scp -i $APP_SERVER_SSH_KEY -r ../deployment-vm-app/checkRequiredEnvVars.sh ubuntu@$APP_SERVER_HOST:/home/ubuntu/deployment/checkRequiredEnvVars.sh
scp -i $APP_SERVER_SSH_KEY -r ../deployment-vm-app/install.sh ubuntu@$APP_SERVER_HOST:/home/ubuntu/deployment/install.sh
scp -i $APP_SERVER_SSH_KEY -r ../deployment-vm-app/setup.sh ubuntu@$APP_SERVER_HOST:/home/ubuntu/deployment/setup.sh
scp -i $APP_SERVER_SSH_KEY -r ../deployment-vm-app/start.sh ubuntu@$APP_SERVER_HOST:/home/ubuntu/deployment/start.sh
scp -i $APP_SERVER_SSH_KEY -r ../deployment-vm-app/startBackEnds.sh ubuntu@$APP_SERVER_HOST:/home/ubuntu/deployment/startBackEnds.sh

scp -i $APP_SERVER_SSH_KEY ../../configs/vm-app/.bash_profile ubuntu@$APP_SERVER_HOST:/home/ubuntu/.bash_profile
scp -i $APP_SERVER_SSH_KEY ../../configs/vm-app/.bashrc ubuntu@$APP_SERVER_HOST:/home/ubuntu/.bashrc
scp -i $APP_SERVER_SSH_KEY ../../configs/vm-app/.env ubuntu@$APP_SERVER_HOST:/home/ubuntu/.env

scp -i $APP_SERVER_SSH_KEY ../../configs/nginx.conf ubuntu@$APP_SERVER_HOST:/home/ubuntu/configs/nginx.conf
scp -i $APP_SERVER_SSH_KEY ../../configs/servers.template.conf ubuntu@$APP_SERVER_HOST:/home/ubuntu/configs/servers.template.conf
