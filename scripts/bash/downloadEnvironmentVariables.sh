#!/bin/bash -e
set +x # do not output commands in this script, as some would show credentials in plain text

BRANCH=$1
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

    # checkout branch specific env vars, or dev as fallback, temporarily redirecting stderr
    exec 3> /dev/stderr 2> /dev/null
    lpass show --notes ${PACKAGE}.${BRANCH}.env > ${ENV_FILE_PATH} || lpass show --notes ${PACKAGE}.dev.env > ${ENV_FILE_PATH}
    exec 2>&3

    # Replace any instances of the placeholder [branch-name] in the .env file with the actual branch
    # name (e.g. [branch-name]-api.tupaia.org -> specific-branch-api.tupaia.org)
    sed -i -e "s/\[branch-name\]/${BRANCH}/g" ${ENV_FILE_PATH}

    if [[ "${BRANCH}" == *-e2e || "${BRANCH}" == e2e ]]; then
        # Update e2e environment variables
        if [[ ${PACKAGE} == "meditrak-server" || ${PACKAGE} == "web-config-server" ]]; then
            sed -i -E 's/^AGGREGATION_URL_PREFIX="?dev-"?$/AGGREGATION_URL_PREFIX=e2e-/g' ${ENV_FILE_PATH}
        fi
    fi
done
