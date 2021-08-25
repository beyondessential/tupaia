#!/bin/bash
set -x

PACKAGE=$1
DIR=$(dirname "$0")
DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)
if curl --output /dev/null --silent --head --fail $DEPLOYMENT_SSH_URL; then
    echo "Deployment for ${CI_BRANCH} exists, building ${PACKAGE}"

    echo "Pulling environment variables"
    set +x # do not output next command, as it would show credentials in plain text
    echo "${LASTPASS_PASSWORD}" | lpass login ${LASTPASS_EMAIL}
    set -x
    lpass show --notes ${PACKAGE}.dev.env > ./packages/${PACKAGE}/.env

    echo "Building"
    yarn workspace @tupaia/${PACKAGE} build
    mv ./packages/${PACKAGE}/served_build/* ./tupaia_builds/${PACKAGE}
else
    echo "No deployment exists for ${CI_BRANCH}, cancelling update"
fi
