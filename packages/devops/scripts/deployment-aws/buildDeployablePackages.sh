#!/usr/bin/env bash
set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
root_dir=$script_dir/../../../..
deployment_name=$1

echo "Building deployable packages"

# Initialise NVM (which sets the path for access to npm, yarn etc. as well)
source "$HOME/.nvm/nvm.sh"

# Install external dependencies
cd "$root_dir"
yarn install --immutable
chmod 755 node_modules/@babel/cli/bin/babel.js

# Suppress output of secrets
set +x

# Inject environment variables from Bitwarden
BW_CLIENTID="$("$script_dir/fetchParameterStoreValue.sh" BW_CLIENTID)"
BW_CLIENTSECRET="$("$script_dir/fetchParameterStoreValue.sh" BW_CLIENTSECRET)"
BW_PASSWORD="$("$script_dir/fetchParameterStoreValue.sh" BW_PASSWORD)"

BW_CLIENTID="$BW_CLIENTID" \
    BW_CLIENTSECRET="$BW_CLIENTSECRET" \
    BW_PASSWORD="$BW_PASSWORD" \
    yarn run download-env-vars "$deployment_name"

# Build packages and their dependencies
package_names_glob=$("$root_dir/scripts/bash/getDeployablePackages.sh" --as-glob)

set -x
REACT_APP_DEPLOYMENT_NAME="$deployment_name" \
    yarn run build:from "$package_names_glob"
set +x
