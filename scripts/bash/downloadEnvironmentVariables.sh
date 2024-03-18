#!/bin/bash -e
set +x # do not output commands in this script, as some would show credentials in plain text

DEPLOYMENT_NAME=$1
DIR=$(dirname "$0")
COLLECTION_PATH="Engineering/Tupaia General/Environment Variables" # Collection in BitWarden where .env vars are kept

# can provide one or more packages as command line arguments, or will default to all
if [ -z $2 ]; then
    echo "Fetching all .env files"
    PACKAGES=$(${DIR}/getPackagesWithEnvFiles.sh)
else
    PACKAGES=${@:2}
    echo "Fetching environment variables for ${PACKAGES}"
fi

# Login to bitwarden
bw login --check || bw login $BITWARDEN_EMAIL $BITWARDEN_PASSWORD
eval "$(bw unlock $BITWARDEN_PASSWORD | grep -o -m 1 'export BW_SESSION=.*$')"

COLLECTION_ID=$(bw get collection "$COLLECTION_PATH" | jq .id)

for PACKAGE in $PACKAGES; do
    ENV_FILE_PATH=${DIR}/../../packages/${PACKAGE}/.env

    # checkout deployment specific env vars, or dev as fallback
    DEPLOYEMNT_ENV_VARS=$(bw list items --search ${PACKAGE}.${DEPLOYMENT_NAME}.env | jq --raw-output "map(select(.collectionIds[] | contains ($COLLECTION_ID))) | .[] .notes")
    if [ -n "$DEPLOYEMNT_ENV_VARS" ]; then
        echo "$DEPLOYEMNT_ENV_VARS" > ${ENV_FILE_PATH}
    else
        DEV_ENV_VARS=$(bw list items --search ${PACKAGE}.dev.env | jq --raw-output "map(select(.collectionIds[] | contains ($COLLECTION_ID))) | .[] .notes")
        echo "$DEV_ENV_VARS" > ${ENV_FILE_PATH}
    fi

    # Replace any instances of the placeholder [deployment-name] in the .env file with the actual deployment
    # name (e.g. [deployment-name]-api.tupaia.org -> specific-deployment-api.tupaia.org)
    sed -i -e "s/\[deployment-name\]/${DEPLOYMENT_NAME}/g" ${ENV_FILE_PATH}

    if [[ "${DEPLOYMENT_NAME}" == *-e2e || "${DEPLOYMENT_NAME}" == e2e ]]; then
        # Update e2e environment variables
        if [[ ${PACKAGE} == "central-server" || ${PACKAGE} == "web-config-server" ]]; then
            sed -i -E 's/^AGGREGATION_URL_PREFIX="?dev-"?$/AGGREGATION_URL_PREFIX=e2e-/g' ${ENV_FILE_PATH}
        fi
    fi

    if [[ "${DEPLOYMENT_NAME}" == dev ]]; then
        # Update dev specific environment variables
        # (removes ###DEV_ONLY### prefixes, leaving the key=value pair uncommented)
        # (after removing prefix, if there are duplicate keys, dotenv uses the last one in the file)
        sed -i -E 's/^###DEV_ONLY###//g' ${ENV_FILE_PATH}
    fi

    echo "downloaded .env vars for $PACKAGE"
done

bw logout