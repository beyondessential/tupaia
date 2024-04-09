#!/bin/bash -xe

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"

APP_SERVER_HOST=${1?Argument 1 - APP_SERVER_HOST required.}
APP_SERVER_SSH_KEY=${2?Argument 2 - APP_SERVER_SSH_KEY required.}

# Copy files up
scp -i $APP_SERVER_SSH_KEY -P $APP_SERVER_PORT -r ../../deployment-common ubuntu@$APP_SERVER_HOST:/home/ubuntu/
scp -i $APP_SERVER_SSH_KEY -P $APP_SERVER_PORT -r ../../deployment-vm-app ubuntu@$APP_SERVER_HOST:/home/ubuntu/
scp -i $APP_SERVER_SSH_KEY -P $APP_SERVER_PORT -r ../../deployment-vm-db ubuntu@$APP_SERVER_HOST:/home/ubuntu/
scp -i $APP_SERVER_SSH_KEY -P $APP_SERVER_PORT -r ../../../configs ubuntu@$APP_SERVER_HOST:/home/ubuntu/