#!/bin/bash

DIR=$(dirname "$0")

# packages with .env files are (currently) all deployable, plus a few extras
PACKAGES=$(${DIR}/getDeployablePackages.sh)
PACKAGES+=" auth data-api entity-server report-server"
echo $PACKAGES
exit 0
