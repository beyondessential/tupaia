#!/bin/sh
set -o errexit -o nounset

# Configure and boot a package
DIR=$(dirname "$0")
TUPAIA_DIR=$DIR/../../
PACKAGE=$1
DEPLOYMENT_NAME=${2:-dev}

# Fetch environment variables from Lastpass and write to .env
"${DIR}"/downloadEnvironmentVariables.sh "${DEPLOYMENT_NAME}" "${PACKAGE}"
cd "$TUPAIA_DIR/packages/${PACKAGE}"
node dist
