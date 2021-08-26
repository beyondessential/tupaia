#!/bin/bash
set -x

PACKAGE=$1

if [ -f "/root/tupaia_builds/deployment_exists" ]; then
    echo "Deployment for ${CI_BRANCH} exists, building ${PACKAGE}"

    echo "Pulling environment variables"
    set +x # do not output next command, as it would show credentials in plain text
    echo "${LASTPASS_PASSWORD}" | lpass login ${LASTPASS_EMAIL}
    set -x
    lpass show --notes ${PACKAGE}.dev.env > ./packages/${PACKAGE}/.env

    echo "Building"
    CI=false yarn workspace @tupaia/${PACKAGE} build # set CI to false to ignore warnings https://github.com/facebook/create-react-app/issues/3657
    mkdir -p /root/tupaia_builds/${PACKAGE}
    mv ./packages/${PACKAGE}/.env /root/tupaia_builds/${PACKAGE}
    mv ./packages/${PACKAGE}/dist /root/tupaia_builds/${PACKAGE}

else
    echo "No deployment exists for ${CI_BRANCH}, skipping build"
fi
