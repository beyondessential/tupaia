#!/usr/bin/env bash
set -ex

HOME_DIR=/home/ubuntu
TUPAIA_DIR=$HOME_DIR/tupaia
LOGS_DIR=$HOME_DIR/logs

SCRIPT_DIR=$(realpath "${BASH_SOURCE[0]}")
cd "$SCRIPT_DIR"

./checkRequiredEnvVars.sh

set -x

../deployment-common/configureNginx.sh

# clone our repo
mkdir -p "$TUPAIA_DIR"
cd "$TUPAIA_DIR"
git status ||
    git clone \
        --depth 1 \
        --branch "$GIT_BRANCH" \
        -- "$GIT_REPO" .
git remote set-branches --add origin "$GIT_BRANCH"
git fetch --all --prune
git reset --hard # clear out any manual changes that have been made, which would cause checkout to fail
git switch "$GIT_BRANCH"
git reset --hard "origin/$GIT_BRANCH"

# Yarn install
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
nvm use
corepack enable yarn
yarn install --immutable

# Fetch env vars
BW_CLIENTID="$BW_CLIENTID" \
    BW_CLIENTSECRET="$BW_CLIENTSECRET" \
    BW_PASSWORD="$BW_PASSWORD" \
    yarn run download-env-vars "$DEPLOYMENT_NAME"

# Build
yarn build:internal-dependencies

echo "Building deployable packages"
PACKAGES=$(${TUPAIA_DIR}/scripts/bash/getDeployablePackages.sh)
for PACKAGE in ${PACKAGES[@]}; do
    echo "Building ${PACKAGE}"
    REACT_APP_DEPLOYMENT_NAME=${DEPLOYMENT_NAME} yarn workspace @tupaia/${PACKAGE} build
done

echo "Tupaia installed successfully"
