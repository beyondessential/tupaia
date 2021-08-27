#!/bin/bash
set -x

PACKAGE=$1

if [ -f "./tupaia/deployment_exists" ]; then
    echo "Deployment for ${CI_BRANCH} exists, building ${PACKAGE}"

    echo "Pulling environment variables"
    set +x # do not output next command, as it would show credentials in plain text
    echo "${LASTPASS_PASSWORD}" | lpass login ${LASTPASS_EMAIL}
    set -x

    # checkout branch specific env vars, or dev as fallback
    lpass show --notes ${PACKAGE}.${CI_BRANCH}.env > ./packages/${PACKAGE}/.env || lpass show --notes ${PACKAGE}.dev.env > ./packages/${PACKAGE}/.env

    # Replace any instances of the placeholder [branch-name] in the .env file with the actual branch
    # name (e.g. [branch-name]-api.tupaia.org -> specific-branch-api.tupaia.org)
    sed -i -e "s/\[branch-name\]/${BRANCH}/g" ./packages/${PACKAGE}/.env

    if [[ "${CI_BRANCH}" == *-e2e || "${CI_BRANCH}" == e2e ]]; then
        # Update e2e environment variables
        if [[ ${PACKAGE} == "meditrak-server" || ${PACKAGE} == "web-config-server" ]]; then
            sed -i -E 's/^AGGREGATION_URL_PREFIX="?dev-"?$/AGGREGATION_URL_PREFIX=e2e-/g' .env
        fi
    fi

    echo "Building"
    CI=false yarn workspace @tupaia/${PACKAGE} build # set CI to false to ignore warnings https://github.com/facebook/create-react-app/issues/3657
else
    echo "No deployment exists for ${CI_BRANCH}, skipping build"
fi
