#!/bin/bash -ex

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"

./checkRequiredEnvVars.sh

../deployment-common/setup.sh

echo "Server set up successfully"