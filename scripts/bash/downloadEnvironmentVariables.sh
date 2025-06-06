#!/usr/bin/env bash
set -e +x # Do not output commands in this script, as some would show credentials in plain text

DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
"$DIR/requireCommands.sh" bw jq

. "$DIR/ansiControlSequences.sh"
DEPLOYMENT_NAME=$1
REPO_ROOT=$(realpath "$DIR/../..")

# Log into Bitwarden
if ! bw login --check &>/dev/null; then
    if [[ -v BW_CLIENTID && -v BW_CLIENTSECRET && -v BW_PASSWORD ]]; then
        # See https://bitwarden.com/help/personal-api-key
        echo -e "${BLUE}==>️${RESET} ${BOLD}Logging into Bitwarden using API key${RESET}"
        bw login --apikey

    elif [[ -v BW_EMAIL && -v BW_PASSWORD ]]; then
        # Legacy behaviour, kept for backward compatibility
        # On new devices, requires OTP which is emailed to Bitwarden account holder
        # See https://bitwarden.com/help/cli/#using-email-and-password
        echo -e "${BLUE}==>️${RESET} ${BOLD}Logging into Bitwarden using email ($BW_EMAIL) and password${RESET}"
        bw login "$BW_EMAIL" "$BW_PASSWORD"

    elif [[ -t 1 ]]; then
        # Requires manual intervention. Bitwarden will prompt for email & password
        # Recommended for interactive sessions
        bw login

    else
        # Automated environment
        echo -e "${BOLD}${RED}Login credentials for Bitwarden are missing.${RESET} Ensure BW_CLIENTID, BW_CLIENTSECRET and BW_PASSWORD environment variables are set." >&2
        echo -e "See ${MAGENTA}https://bitwarden.com/help/personal-api-key${RESET}" >&2
        exit 1
    fi
fi

cleanup() {
    echo
    echo -e "${BLUE}==>️${RESET} ${BOLD}Logging out of Bitwarden${RESET}"
    bw logout

    # Clean up detritus on macOS
    # macOS and Ubuntu’s interfaces for sed are slightly different. In this script, we use it in a
    # way that’s compatible to both (by not supplying a suffix for the -i flag), but this causes
    # macOS to generate backup files which we don’t need.
    if [[ $(uname) = 'Darwin' ]]; then
        rm -f "$REPO_ROOT"/env/*.env-e "$REPO_ROOT"/packages/*/.env-e
    fi
}

trap cleanup EXIT

# Unlock Bitwarden vault
if [[ ! -t 1 && ! -v BW_PASSWORD ]]; then
    echo -e "${BOLD}${RED}Bitwarden password is missing.${RESET} BW_PASSWORD environment variable must be set to unlock the vault."
    exit 1
fi
eval "$(bw unlock --passwordenv BW_PASSWORD | grep -o -m 1 'export BW_SESSION=.*$')"

# Collection in BitWarden where .env vars are kept
COLLECTION_PATH='Engineering/Tupaia General/Environment Variables'
COLLECTION_ID=$(bw get collection "$COLLECTION_PATH" | jq .id)

echo

# Can provide one or more packages as command line arguments, or will default to all
if [[ -z $2 ]]; then
    PACKAGES=$("$DIR/getPackagesWithEnvFiles.sh")
    echo -e "${BLUE}==>️${RESET} ${BOLD}Fetching environment variables for all packages${RESET}"
else
    PACKAGES=("${@:2}")
    echo -e "${BLUE}==>️${RESET} ${BOLD}Fetching environment variables for ${PACKAGES[*]}${RESET}"
fi

load_env_file_from_bw() {
    FILE_NAME=$1
    BASE_FILE_PATH=$2
    NEW_FILE_NAME=$3
    ENV_FILE_PATH=$BASE_FILE_PATH/$NEW_FILE_NAME.env

    echo -en "${YELLOW}🚚 Fetching variables for ${BOLD}${FILE_NAME}...${RESET}"

    # checkout deployment specific env vars, or dev as fallback
    DEPLOYMENT_ENV_VARS=$(bw list items --search "$FILE_NAME.$DEPLOYMENT_NAME.env" | jq --raw-output "map(select(.collectionIds[] | contains ($COLLECTION_ID))) | .[] .notes")

    if [[ -n $DEPLOYMENT_ENV_VARS ]]; then
        echo "$DEPLOYMENT_ENV_VARS" >"$ENV_FILE_PATH"
    else
        DEV_ENV_VARS=$(bw list items --search "$FILE_NAME.dev.env" | jq --raw-output "map(select(.collectionIds[] | contains ($COLLECTION_ID))) | .[] .notes")
        echo "$DEV_ENV_VARS" >"$ENV_FILE_PATH"
    fi

    # Replace any instances of the placeholder [deployment-name] in the .env file with the actual
    # deployment name (e.g. [deployment-name]-api.tupaia.org -> specific-deployment-api.tupaia.org)
    sed -i -e "s/\[deployment-name\]/$DEPLOYMENT_NAME/g" "$ENV_FILE_PATH"

    if [[ -v DOMAIN ]]; then
        # Replace the placeholder [domain]
        sed -i -e "s/\[domain\]/$DOMAIN/g" "$ENV_FILE_PATH"
    fi

    if [[ $DEPLOYMENT_NAME = *-e2e || $DEPLOYMENT_NAME = e2e ]]; then
        # Update e2e environment variables
        if [[ $FILE_NAME = aggregation ]]; then
            sed -i -e 's/^AGGREGATION_URL_PREFIX="?dev-"?$/AGGREGATION_URL_PREFIX=e2e-/g' "$ENV_FILE_PATH"
        fi
    fi

    if [[ $DEPLOYMENT_NAME = dev ]]; then
        # Update dev specific environment variables
        # (removes ###DEV_ONLY### prefixes, leaving the key=value pair uncommented)
        # (after removing prefix, if there are duplicate keys, dotenv uses the last one in the file)
        sed -i -e 's/^###DEV_ONLY###//g' "$ENV_FILE_PATH"
    fi

    echo -en "$CLEAR_LINE"
    echo -e "${GREEN}✅ Downloaded variables for ${BOLD}${FILE_NAME}${RESET} → $ENV_FILE_PATH"
}

for PACKAGE in $PACKAGES; do
    # Only download the env file if there is an example file in the package. If there isn’t, this
    # means it is a package that doesn’t need env vars
    if [[ -f $REPO_ROOT/packages/$PACKAGE/.env.example ]]; then
        load_env_file_from_bw "$PACKAGE" "$REPO_ROOT/packages/$PACKAGE" ''
    fi
done

for file_name in "$REPO_ROOT"/env/*.env.example; do
    package_name=$(basename "$file_name" '.env.example')
    load_env_file_from_bw "$package_name" "$REPO_ROOT/env" "$package_name"
done
