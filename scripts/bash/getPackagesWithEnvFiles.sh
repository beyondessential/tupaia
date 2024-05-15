#!/bin/bash -e

DIR=$(dirname "$0")

# packages with .env files are (currently) all deployable, plus auth, data-api, and database
PACKAGES=$(${DIR}/getDeployablePackages.sh)
PACKAGES+=" data-api viz-test-tool"
echo $PACKAGES
exit 0
