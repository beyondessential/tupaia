#!/bin/bash

DIR=$(dirname "$0")

# packages with .env files are (currently) all deployable, plus auth, data-api, and database
PACKAGES=$(${DIR}/getDeployablePackages.sh)
PACKAGES+=" auth data-api database"
echo $PACKAGES
exit 0
