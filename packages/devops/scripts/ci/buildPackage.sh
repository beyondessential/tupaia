#!/bin/bash -e
set -x

DIR=$(dirname "$0")
PACKAGE=$1
${DIR}/copyFromCommonVolume.sh # pull in the .env files from common volume

if [ -f "/common/deployment_exists" ]; then
    echo "Deployment for ${CI_BRANCH} exists, building ${PACKAGE}"
    REACT_APP_BRANCH=${CI_BRANCH} CI=false yarn workspace @tupaia/${PACKAGE} build # set CI to false to ignore warnings https://github.com/facebook/create-react-app/issues/3657

    # push build artefacts to common volume
    if [ -d "./packages/${PACKAGE}/build" ]; then
        # must be a front end build
        ${DIR}/copyToCommonVolume.sh "packages/${PACKAGE}" "build"
    else
        # must be a back end build
        ${DIR}/copyToCommonVolume.sh "packages/${PACKAGE}" "dist"
    fi
else
    echo "No deployment exists for ${CI_BRANCH}, skipping build"
fi
