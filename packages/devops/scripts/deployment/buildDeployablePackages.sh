#!/bin/bash -le

DIR=$(dirname "$0")
TUPAIA_DIR=$DIR/../../../..
DEPLOYMENT_NAME=$1
PACKAGES=$(${TUPAIA_DIR}/scripts/bash/getDeployablePackages.sh)

# Initialise NVM (which sets the path for access to npm, yarn etc. as well)
. $HOME/.nvm/nvm.sh

# Install external dependencies and build internal dependencies
cd ${TUPAIA_DIR}
yarn install

# Inject environment variables from LastPass
LASTPASS_EMAIL=$($DIR/fetchParameterStoreValue.sh LASTPASS_EMAIL)
LASTPASS_PASSWORD=$($DIR/fetchParameterStoreValue.sh LASTPASS_PASSWORD)
LASTPASS_EMAIL=$LASTPASS_EMAIL LASTPASS_PASSWORD=$LASTPASS_PASSWORD yarn download-env-vars $DEPLOYMENT_NAME

# Build each package
for PACKAGE in ${PACKAGES[@]}; do
    echo "Building ${PACKAGE}"
    REACT_APP_DEPLOYMENT_NAME=${DEPLOYMENT_NAME} yarn workspace @tupaia/${PACKAGE} build
done
