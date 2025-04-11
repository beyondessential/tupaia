#!/usr/bin/env bash
set -le

DIR=$(dirname "$0")
TUPAIA_DIR=$DIR/../../../..
DEPLOYMENT_NAME=$1

echo "Building deployable packages"

# Initialise NVM (which sets the path for access to npm, yarn etc. as well)
source "$HOME/.nvm/nvm.sh"

# Install external dependencies
cd "$TUPAIA_DIR"
yarn install --immutable
chmod 755 node_modules/@babel/cli/bin/babel.js

# Inject environment variables from Bitwarden
BW_CLIENTID="$("$DIR/fetchParameterStoreValue.sh" BW_CLIENTID)"
BW_CLIENTSECRET="$("$DIR/fetchParameterStoreValue.sh" BW_CLIENTSECRET)"
BW_PASSWORD="$("$DIR/fetchParameterStoreValue.sh" BW_PASSWORD)"

BW_CLIENTID="$BW_CLIENTID" \
    BW_CLIENTSECRET="$BW_CLIENTSECRET" \
    BW_PASSWORD="$BW_PASSWORD" \
    yarn download-env-vars "$DEPLOYMENT_NAME"

# Build packages and their dependencies
PACKAGE_NAMES_GLOB=$("$TUPAIA_DIR/scripts/bash/getDeployablePackages.sh" --glob)

set -x
REACT_APP_DEPLOYMENT_NAME="$DEPLOYMENT_NAME" \
    yarn run build:from "$PACKAGE_NAMES_GLOB"
set +x
