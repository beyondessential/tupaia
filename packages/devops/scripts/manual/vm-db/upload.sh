#!/bin/bash -xe

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"

DB_SERVER_HOST=${1?Argument 1 - DB_SERVER_HOST required.}
DB_SERVER_SSH_KEY=${2?Argument 2 - DB_SERVER_SSH_KEY required.}

# Make dirs
ssh -i $DB_SERVER_SSH_KEY ubuntu@$DB_SERVER_HOST 'mkdir -p /home/ubuntu/deployment/'
ssh -i $DB_SERVER_SSH_KEY ubuntu@$DB_SERVER_HOST 'mkdir -p /home/ubuntu/logs'

# Copy files up
scp -i $DB_SERVER_SSH_KEY -r ../../deployment-vm-db/setup.sh ubuntu@$DB_SERVER_HOST:/home/ubuntu/deployment/setup.sh
