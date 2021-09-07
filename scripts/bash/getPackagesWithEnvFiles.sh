#!/bin/bash

DIR=$(dirname "$0")

# packages with .env files are (currently) all deployable, plus a auth and data-api
PACKAGES=$(${DIR}/getDeployablePackages.sh)
PACKAGES+=" auth data-api"
echo $PACKAGES
exit 0
