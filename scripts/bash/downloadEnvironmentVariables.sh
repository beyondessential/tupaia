#!/usr/bin/env bash
set -e +x # Do not output commands in this script, as some would show credentials in plain text

dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

if ! "$dir"/requireCommands.sh yarn jq; then
    exit 1
fi

. "$dir/ansiControlSequences.sh"

assert_deployment_name_is_valid() {
    local deployment_name=$1
    if [[ ! $deployment_name =~ ^[a-z0-9-]+$ ]]; then
        echo -e "${BOLD}${RED}Invalid deployment name ‘$deployment_name’.${RESET} Use only lowercase alphanumerics and hyphens." >&2
        exit 1
    fi
}

assert_domain_is_valid() {
    local domain=$1
    if [[ ! $domain =~ ^[a-z0-9.-]+$ ]]; then
        echo -e "${BOLD}${RED}Invalid DOMAIN ‘$domain’.${RESET} Use only lowercase alphanumerics, hyphens and full stops." >&2
        exit 1
    fi
}

deployment_name=$1
repo_root=$(realpath "$dir/../..")

# These values are substituted into the .env files, so restrict them to characters valid in a
# hostname. Validate before touching Bitwarden.
assert_deployment_name_is_valid "$deployment_name"
if [[ -v DOMAIN ]]; then
    assert_domain_is_valid "$DOMAIN"
fi

# Log into Bitwarden
if ! yarn bw login --check &>/dev/null; then
    if [[ -v BW_CLIENTID && -v BW_CLIENTSECRET && -v BW_PASSWORD ]]; then
        # See https://bitwarden.com/help/personal-api-key
        echo -e "${BLUE}==>️${RESET} ${BOLD}Logging into Bitwarden using API key${RESET}"
        yarn bw login --apikey

    elif [[ -t 1 ]]; then
        # Requires manual intervention. Bitwarden will prompt for email & password
        # Recommended for interactive sessions
        yarn bw login

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
    yarn bw logout
    echo
}

trap cleanup EXIT

# Unlock Bitwarden vault
if [[ ! -t 1 && ! -v BW_PASSWORD ]]; then
    echo -e "${BOLD}${RED}Bitwarden password is missing.${RESET} BW_PASSWORD environment variable must be set to unlock the vault."
    exit 1
fi
eval "$(yarn bw unlock --passwordenv BW_PASSWORD | grep -o -m 1 'export BW_SESSION=.*$')"

# The session token is all we need from here on; keep long-lived credentials out of child processes
unset BW_CLIENTID BW_CLIENTSECRET BW_PASSWORD

# Collection in BitWarden where .env vars are kept
collection_path='Engineering/Tupaia General/Environment Variables'
collection_id=$(yarn bw get collection "$collection_path" | jq --raw-output .id)

# Fetch the whole collection up front, and search it locally from there on. This is much faster.
collection=$(yarn bw list items --collectionid "$collection_id")

if [[ -z $collection || $collection = '[]' ]]; then
    echo -e "${BOLD}${RED}Bitwarden collection is empty.${RESET} No items found in $collection_path" >&2
    exit 1
fi

get_note() {
    local search_term=$1
    printf '%s' "$collection" |
        jq --raw-output --arg search "$search_term" \
            'map(select(.name | ascii_downcase | contains($search | ascii_downcase))) | .[] .notes'
}

echo

get_packages_with_env_files() {
    # All deployable packages depend on .env files...
    readarray -t packages_with_env_files < <("$dir"/getDeployablePackages.sh)
    # ...plus these
    packages_with_env_files+=(data-api viz-test-tool)
    printf '%s\n' "${packages_with_env_files[@]}"
}

# Can provide one or more packages as command line arguments, or will default to all
if [[ -z $2 ]]; then
    readarray -t packages < <(get_packages_with_env_files)
    echo -e "${BLUE}==>️${RESET} ${BOLD}Loading environment variables for all packages${RESET}"
else
    packages=("${@:2}")
    echo -e "${BLUE}==>️${RESET} ${BOLD}Loading environment variables for ${packages[*]}${RESET}"
fi

load_env_file_from_bw() {
    local file_name=$1
    local base_file_path=$2
    local new_file_name=$3
    local env_file_path=$base_file_path/$new_file_name.env

    if [[ -t 1 ]]; then
        echo -en "${YELLOW}🚚 Loading variables for ${BOLD}${file_name}...${RESET}"
    fi

    # checkout deployment specific env vars, or dev as fallback
    local contents
    contents=$(get_note "$file_name.$deployment_name.env")

    if [[ -z $contents ]]; then
        contents=$(get_note "$file_name.dev.env")

        if [[ -z $contents ]]; then
            echo >"$env_file_path"
            if [[ -t 1 ]]; then
                echo -en "$CLEAR_LINE"
            fi
            echo -e "${YELLOW}⚠️ No item named ${BOLD}${file_name}.$deployment_name.env${RESET} or ${BOLD}${file_name}.dev.env${RESET}${YELLOW}. Wrote empty file to $env_file_path."
            return
        fi
    fi

    # Replace any instances of the placeholder [deployment-name] in the .env file with the actual
    # deployment name (e.g. [deployment-name]-api.tupaia.org -> specific-deployment-api.tupaia.org)
    contents=${contents//'[deployment-name]'/"$deployment_name"}

    if [[ -v DOMAIN ]]; then
        # Replace the placeholder [domain]
        contents=${contents//'[domain]'/"$DOMAIN"}
    fi

    if [[ $deployment_name = *-e2e || $deployment_name = e2e ]]; then
        # Update e2e environment variables
        if [[ $file_name = aggregation ]]; then
            contents=$(sed -e 's/^AGGREGATION_URL_PREFIX="?dev-"?$/AGGREGATION_URL_PREFIX=e2e-/g' <<<"$contents")
        fi
    fi

    if [[ $deployment_name = dev ]]; then
        # Update dev specific environment variables
        # (removes ###DEV_ONLY### prefixes, leaving the key=value pair uncommented)
        # (after removing prefix, if there are duplicate keys, dotenv uses the last one in the file)
        contents=$(sed -e 's/^###DEV_ONLY###//g' <<<"$contents")
    fi

    echo "$contents" >"$env_file_path"

    if [[ -t 1 ]]; then
        echo -en "$CLEAR_LINE"
    fi
    echo -e "${GREEN}✅ Wrote ${BOLD}${file_name}${RESET} → $env_file_path"
}

for package_name in "${packages[@]}"; do
    # Only download the env file if there is an example file in the package. If there isn’t, this
    # means it is a package that doesn’t need env vars
    if [[ -f $repo_root/packages/$package_name/.env.example ]]; then
        load_env_file_from_bw "$package_name" "$repo_root/packages/$package_name" ''
    fi
done

echo
echo -e "${BLUE}==>️${RESET} ${BOLD}Loading shared environment variables${RESET}"
for file_name in "$repo_root"/env/*.env.example; do
    package_name=$(basename "$file_name" '.env.example')
    load_env_file_from_bw "$package_name" "$repo_root/env" "$package_name"
done
