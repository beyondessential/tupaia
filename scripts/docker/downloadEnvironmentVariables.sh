#!/usr/bin/env bash
set -e

# Fetch environment from LastPass, write to ${ENV_DEST}/${DEPLOYMENT_NAME}/.env
# Is modified from ../../scripts/bash/downloadEnvironmentVariables.sh

# Attempting multiple logins to LastPass from the same IP in succession often
# results in LastPass blocking the IP for some time. To avoid getting blocked
# the script can be run by a "non essential" container in the ECS Task to fetch
# configuration from LastPass prior to the application containers starting. The
# configuration is written to a Docker volume which can be mounted into each
# application container.

# The following changes have been made to the original script:

# - By not being in the ../../scripts/bash directory, modifications to this
#   script don't invalidate the Docker cache prior to the application packages
#   build. This was done to speed up development and testing of the script.
#
# - Containers running in the ECS task will read env files from a common volume
#   mount. To support this a destination directory needs to be provided as the
#   first argument.
#
# - The fallback to 'dev' environments has been removed, if the specified
#   deployment name is missing from the LastPass vault the script will error.

# Usage: downloadEnvironmentVariables.sh <deployment-name> <env-root-dir> [package]...

set +x # do not output commands in this script, as some would show credentials in plain text

DEPLOYMENT_NAME=$1
ENV_DEST=$2
DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

# can provide one or more packages as command line arguments, or will default to all
if [[ -z $3 ]]; then
    echo 'Fetching all .env files'
    PACKAGES=$(${DIR}/../bash/getPackagesWithEnvFiles.sh)
else
    PACKAGES=${@:3}
    echo "Fetching environment variables for ${PACKAGES}"
fi

echo ${LASTPASS_PASSWORD} | LPASS_DISABLE_PINENTRY=1 lpass login ${LASTPASS_EMAIL}

for PACKAGE in $PACKAGES; do
    ENV_FILE_DIR="${ENV_DEST}/packages/${PACKAGE}"
    mkdir -p "$ENV_FILE_DIR"
    ENV_FILE_PATH="${ENV_FILE_DIR}/.env"
    # checkout deployment specific env vars
    lpass show --notes ${PACKAGE}.${DEPLOYMENT_NAME}.env >${ENV_FILE_PATH}

    # Replace any instances of the placeholder [deployment-name] in the .env file with the actual deployment
    # name (e.g. [deployment-name]-api.tupaia.org -> specific-deployment-api.tupaia.org)
    sed -i -e "s/\[deployment-name\]/${DEPLOYMENT_NAME}/g" ${ENV_FILE_PATH}

    if [[ $DEPLOYMENT_NAME = *-e2e || $DEPLOYMENT_NAME = e2e ]]; then
        # Update e2e environment variables
        if [[ $PACKAGE = central-server || $PACKAGE = web-config-server ]]; then
            sed -i -E 's/^AGGREGATION_URL_PREFIX="?dev-"?$/AGGREGATION_URL_PREFIX=e2e-/g' ${ENV_FILE_PATH}
        fi
    fi

    if [[ $DEPLOYMENT_NAME = 'dev' ]]; then
        # Update dev specific environment variables
        # (removes ###DEV_ONLY### prefixes, leaving the key=value pair uncommented)
        # (after removing prefix, if there are duplicate keys, dotenv uses the last one in the file)
        sed -i -E 's/^###DEV_ONLY###//g' ${ENV_FILE_PATH}
    fi
done
