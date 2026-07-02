#!/usr/bin/env bash
set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
root_dir=$script_dir/../../../..
deployment_name=$1

echo "Building deployable packages"

# Initialise NVM (which sets the path for access to npm, yarn etc. as well)
source "$HOME/.nvm/nvm.sh"

cd "$root_dir"

# In case .nvmrc has changed in current branch (normally redundant)
nvm install --default

# PM2 is installed per Node version; reinstall if nvm switched versions
if ! command -v pm2 &>/dev/null; then
  echo 'PM2 not found (likely because Node version changed from AMI). Installing...'
  npm install --global pm2@^6.0.8
fi
echo "PM2 $(pm2 --version) is installed"
pm2 install pm2-logrotate

# Use Yarn version declared in package.json
npm install --global --min-release-age=7 corepack
corepack enable yarn

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
NODE_OPTIONS='--max-old-space-size=4096' \
    REACT_APP_DEPLOYMENT_NAME="$deployment_name" \
    yarn run build:from "$package_names_glob"
set +x
