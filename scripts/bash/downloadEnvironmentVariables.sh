#!/bin/bash -e
set +x # do not output commands in this script, as some would show credentials in plain text

DEPLOYMENT_NAME=$1
DIR=$(dirname "$0")

# can provide one or more packages as command line arguments, or will default to all
if [ -z $2 ]; then
    echo "Fetching all .env files"
    PACKAGES=$(${DIR}/getPackagesWithEnvFiles.sh)
else
    PACKAGES=${@:2}
    echo "Fetching environment variables for ${PACKAGES}"
fi

echo ${LASTPASS_PASSWORD} | LPASS_DISABLE_PINENTRY=1 lpass login ${LASTPASS_EMAIL}

for PACKAGE in $PACKAGES; do
    ENV_FILE_PATH=${DIR}/../../packages/${PACKAGE}/.env

    # checkout deployment specific env vars, or dev as fallback, temporarily redirecting stderr
    lpass show --notes ${PACKAGE}.${DEPLOYMENT_NAME}.env 2> /dev/null > ${ENV_FILE_PATH} || lpass show --notes ${PACKAGE}.dev.env > ${ENV_FILE_PATH}

    # Replace any instances of the placeholder [deployment-name] in the .env file with the actual deployment
    # name (e.g. [deployment-name]-api.tupaia.org -> specific-deployment-api.tupaia.org)
    sed -i -e "s/\[deployment-name\]/${DEPLOYMENT_NAME}/g" ${ENV_FILE_PATH}

    if [[ "${DEPLOYMENT_NAME}" == *-e2e || "${DEPLOYMENT_NAME}" == e2e ]]; then
        # Update e2e environment variables
        if [[ ${PACKAGE} == "meditrak-server" || ${PACKAGE} == "web-config-server" ]]; then
            sed -i -E 's/^AGGREGATION_URL_PREFIX="?dev-"?$/AGGREGATION_URL_PREFIX=e2e-/g' ${ENV_FILE_PATH}
        fi
    fi

    if [[ "${DEPLOYMENT_NAME}" == dev ]]; then
        # Update dev specific environment variables
        # (removes ###DEV_ONLY### prefixes, leaving the key=value pair uncommented)
        # (after removing prefix, if there are duplicate keys, dotenv uses the last one in the file)
        sed -i -E 's/^###DEV_ONLY###//g' ${ENV_FILE_PATH}
    fi
done
