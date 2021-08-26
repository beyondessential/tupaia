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
    mkdir -p /root/tupaia_builds # in case tupaia_builds doesn't yet exist
    rm -rf /root/tupaia_builds/${PACKAGE} # in the odd case that build might be running a second time
    if [[ $PACKAGE == *server ]]; then
        # back end package, move dist and .env
        mkdir /root/tupaia_builds/${PACKAGE}
        mv ./packages/${PACKAGE}/dist /root/tupaia_builds/${PACKAGE}/dist
        mv ./packages/${PACKAGE}/.env /root/tupaia_builds/${PACKAGE}/.env
    else
        # front end package, move contents of build folder
        mv ./packages/${PACKAGE}/build /root/tupaia_builds/${PACKAGE}
    fi
else
    echo "No deployment exists for ${CI_BRANCH}, skipping build"
fi
