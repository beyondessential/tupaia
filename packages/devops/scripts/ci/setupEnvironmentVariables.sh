#!/bin/bash -e
set -x
DIR=$(dirname "$0")

PACKAGES=$(${DIR}/../../../../scripts/bash/getPackagesWithEnvFiles.sh)

# download environment variables
${DIR}/../../../../scripts/bash/downloadEnvironmentVariables.sh ${CI_BRANCH} ${PACKAGES}

# copy environment variables to common
for PACKAGE in $PACKAGES; do
    ${DIR}/copyToCommonVolume.sh "packages/${PACKAGE}" ".env"
done
