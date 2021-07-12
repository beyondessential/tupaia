#!/bin/bash
set -x

if [ "${BRANCH}" == "" ]; then
    echo "Missing env var BRANCH (master | dev | ...)"
    exit 1
fi
if [ "${ENVIRONMENT}" == "" ]; then
    echo "Missing env var ENVIRONMENT (production | e2e | dev)"
    exit 1
fi

HOME_DIRECTORY=$PWD

PACKAGES=("meditrak-server" "web-config-server" "psss-server" "lesmis-server" "report-server" "entity-server" "web-frontend" "admin-panel" "psss" "lesmis")

for PACKAGE in ${PACKAGES[@]}; do
    # reset cwd back to `/tupaia`
    cd ${HOME_DIRECTORY}

    PATH_TO_PACKAGE="${HOME_DIRECTORY}/packages/${PACKAGE}"

    # Set up .env to match the environment variables stored in SSM parameter store
    yarn download-parameter-store-env-vars --package-name $PACKAGE --environment $ENVIRONMENT --path-to-package "${PATH_TO_PACKAGE}"

    cd ${PATH_TO_PACKAGE}

    # Replace any instances of the placeholder [branch-name] in the .env file with the actual branch
    # name (e.g. [branch-name]-api.tupaia.org -> specific-branch-api.tupaia.org)
    sed -i -e "s/\[branch-name\]/${BRANCH}/g" .env
done

echo "Environment fetched"
