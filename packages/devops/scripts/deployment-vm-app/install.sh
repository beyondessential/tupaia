#!/bin/bash -ex

HOME_DIR=/home/ubuntu
TUPAIA_DIR=$HOME_DIR/tupaia
LOGS_DIR=$HOME_DIR/logs

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"

./checkRequiredEnvVars.sh

set -x

../deployment-common/configureNginx.sh

# clone our repo
mkdir -p $TUPAIA_DIR
cd $TUPAIA_DIR
git status || git clone -b $GIT_BRANCH $GIT_REPO .
git remote set-branches --add origin ${GIT_BRANCH}
git fetch --all --prune
git reset --hard # clear out any manual changes that have been made, which would cause checkout to fail
git checkout ${GIT_BRANCH}
git reset --hard origin/${GIT_BRANCH}

# Yarn install
yarn install --immutable

# Fetch env vars
echo "Note: if lastpass fails, check email account $LASTPASS_EMAIL for a verification check"
LASTPASS_EMAIL=$LASTPASS_EMAIL LASTPASS_PASSWORD=$LASTPASS_PASSWORD yarn download-env-vars $DEPLOYMENT_NAME

# Build
yarn build:internal-dependencies

echo "Building deployable packages"
PACKAGES=$(${TUPAIA_DIR}/scripts/bash/getDeployablePackages.sh)
for PACKAGE in ${PACKAGES[@]}; do
    echo "Building ${PACKAGE}"
    REACT_APP_DEPLOYMENT_NAME=${DEPLOYMENT_NAME} yarn workspace @tupaia/${PACKAGE} build
done

echo "Tupaia installed successfully"