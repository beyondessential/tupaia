#!/bin/bash

# packages with .env files are (currently) all deployable, plus auth and data-api
PACKAGES=$(${DIR}/../../../../scripts/bash/getDeployablePackages.sh)
PACKAGES+=" auth data-api"
echo $PACKAGES
exit 0
