#!/bin/bash -e
set -x
DIR=$(dirname "$0")

PACKAGES=$(${DIR}/../../../../scripts/bash/getPackagesWithEnvFiles.sh)

# download environment variables
${DIR}/../../../../scripts/bash/downloadEnvironmentVariables.sh ${CI_BRANCH} ${PACKAGES}

# copy environment variables to common environment_variables volume
for PACKAGE in $PACKAGES; do
    mkdir -p "/environment_variables/packages/${PACKAGE}"
    cp -r "/tupaia/packages/${PACKAGE}/.env" "/environment_variables/packages/${PACKAGE}/.env"
done
