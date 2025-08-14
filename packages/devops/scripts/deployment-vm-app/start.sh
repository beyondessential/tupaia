#!/bin/bash -ex

HOME_DIR=/home/ubuntu
TUPAIA_DIR=$HOME_DIR/tupaia

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"

./checkRequiredEnvVars.sh

# Start servers
../deployment-common/startBackEnds.sh

# Restart nginx
sudo service nginx restart