#!/usr/bin/env bash
set -e +x # Do not output commands in this script, as some would show credentials in plain text

DEPLOYMENT_NAME=$1
DIR=$(dirname "$0")
COLLECTION_PATH="Engineering/Tupaia General/Environment Variables" # Collection in BitWarden where .env vars are kept

# Log in to bitwarden
bw login --check || bw login $BITWARDEN_EMAIL $BITWARDEN_PASSWORD
eval "$(bw unlock $BITWARDEN_PASSWORD | grep -o -m 1 'export BW_SESSION=.*$')"

COLLECTION_ID=$(bw get collection "$COLLECTION_PATH" | jq .id)

# Can provide one or more packages as command line arguments, or will default to all
if [ -z $2 ]; then
    echo "Fetching all .env files"
    PACKAGES=$(${DIR}/getPackagesWithEnvFiles.sh)
else
    PACKAGES=${@:2}
    echo "Fetching environment variables for ${PACKAGES}"
fi


load_env_file_from_bw () {
    FILE_NAME=$1
    BASE_FILE_PATH=$2 
    NEW_FILE_NAME=$3
    ENV_FILE_PATH=${BASE_FILE_PATH}/${NEW_FILE_NAME}.env

    echo "Fetching environment variables for $FILE_NAME: $ENV_FILE_PATH"

    # checkout deployment specific env vars, or dev as fallback
    DEPLOYMENT_ENV_VARS=$(bw list items --search ${FILE_NAME}.${DEPLOYMENT_NAME}.env | jq --raw-output "map(select(.collectionIds[] | contains ($COLLECTION_ID))) | .[] .notes")

    if [ -n "$DEPLOYMENT_ENV_VARS" ]; then
        echo "$DEPLOYMENT_ENV_VARS" > ${ENV_FILE_PATH}
    else
        DEV_ENV_VARS=$(bw list items --search ${FILE_NAME}.dev.env | jq --raw-output "map(select(.collectionIds[] | contains ($COLLECTION_ID))) | .[] .notes")
        echo "$DEV_ENV_VARS" > ${ENV_FILE_PATH}
    fi

    # Replace any instances of the placeholder [deployment-name] in the .env file with the actual deployment
    # name (e.g. [deployment-name]-api.tupaia.org -> specific-deployment-api.tupaia.org)
    sed -i -e "s/\[deployment-name\]/${DEPLOYMENT_NAME}/g" "${ENV_FILE_PATH}"
   

    if [[ "${DEPLOYMENT_NAME}" == *-e2e || "${DEPLOYMENT_NAME}" == e2e ]]; then
        # Update e2e environment variables
        if [[ ${FILE_NAME} == "aggregation" ]]; then
            sed -i -e 's/^AGGREGATION_URL_PREFIX="?dev-"?$/AGGREGATION_URL_PREFIX=e2e-/g' ${ENV_FILE_PATH}
        fi
    fi

    if [[ "${DEPLOYMENT_NAME}" == dev ]]; then
        # Update dev specific environment variables
        # (removes ###DEV_ONLY### prefixes, leaving the key=value pair uncommented)
        # (after removing prefix, if there are duplicate keys, dotenv uses the last one in the file)
        sed -i -e 's/^###DEV_ONLY###//g' ${ENV_FILE_PATH}
    fi


    echo "downloaded .env vars for $FILE_NAME"
}


for PACKAGE in $PACKAGES; do
    # only download the env file if there is an example file in the package. If there isn't, this means it is a package that doesn't need env vars
    has_example_env_in_package=$(find $DIR/../../packages/$PACKAGE -type f -name '*.env.example' | wc -l)
    if [ $has_example_env_in_package -eq 1 ]; then
        load_env_file_from_bw $PACKAGE $DIR/../../packages/$PACKAGE ""
    fi
done
 

for file_name in *.env.example; do
    env_name="${file_name%.env.example}" # Get its basename without the .env.example extension
    load_env_file_from_bw $env_name $DIR/../../env $env_name
done


# Log out of Bitwarden
bw logout
