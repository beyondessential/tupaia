#!/bin/bash
set -x
DIR=$(dirname "$0")

# packages needing .env during CI/CD are all deployable, plus auth and data-api
PACKAGES=$(${DIR}/../../../../scripts/bash/getDeployablePackages.sh)
PACKAGES+=" auth data-api"

# download environment variables
${DIR}/../../../../scripts/bash/downloadEnvironmentVariables.sh ${CI_BRANCH} ${PACKAGES}

# copy environment variables to common
for PACKAGE in $PACKAGES; do
    ${DIR}/copyToCommonVolume.sh "packages/${PACKAGE}" ".env"
done
