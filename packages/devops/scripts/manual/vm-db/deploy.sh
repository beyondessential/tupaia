#!/bin/bash -xe

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"

DB_SERVER_HOST=${1?Argument 1 - DB_SERVER_HOST required.}
DB_SERVER_SSH_KEY=${2?Argument 2 - DB_SERVER_SSH_KEY required.}
APP_SERVER_PORT=${3?Argument 3 - APP_SERVER_PORT required.}

# Upload files
./upload.sh $DB_SERVER_HOST $DB_SERVER_SSH_KEY $APP_SERVER_PORT

# Make logs dir
ssh -i $DB_SERVER_SSH_KEY -p $APP_SERVER_PORT ubuntu@$DB_SERVER_HOST 'mkdir -p /home/ubuntu/logs'

# Setup machine
ssh -i $DB_SERVER_SSH_KEY -p $APP_SERVER_PORT ubuntu@$DB_SERVER_HOST 'bash -l /home/ubuntu/deployment/setup.sh'

echo "Deployed"