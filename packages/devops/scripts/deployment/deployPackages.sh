#!/bin/bash

# Kill all pm2 processes
echo "Existing processes:"
pm2 list
echo "Deleting existing backend processes..."
pm2 delete all
echo "Deleting existing frontend builds..."
cd ${HOME_DIRECTORY}
# delete all "served_build" folders, which is where most front ends are served from
find ./packages -type d -name "served_build" -maxdepth 2 -exec rm -rf {} \;
# delete "builds" from web-frontend, which is where those builds are served from
rm -rf ./packages/web-frontend/builds


# Set the path of environment variables from parameter store
if [[ $BRANCH == "master" ]]; then
    ENVIRONMENT="production"
else
    # Any other branch uses the default dev environment variables
    ENVIRONMENT="dev"
fi

PACKAGES=("meditrak-server" "web-config-server" "psss-server" "lesmis-server" "admin-panel-server" "report-server" "entity-server" "web-frontend" "admin-panel" "psss" "lesmis")
# For each package, get the latest and deploy it
for PACKAGE in ${PACKAGES[@]}; do
    # reset cwd back to `/tupaia`
    cd ${HOME_DIRECTORY}

    # Set up .env to match the environment variables stored in SSM parameter store
    yarn download-parameter-store-env-vars --package-name $PACKAGE --environment $ENVIRONMENT

    cd ${HOME_DIRECTORY}/packages/$PACKAGE

    # Replace any instances of the placeholder [branch-name] in the .env file with the actual branch
    # name (e.g. [branch-name]-api.tupaia.org -> specific-branch-api.tupaia.org)
    sed -i -e "s/\[branch-name\]/${BRANCH}/g" .env

    if [[ "$BRANCH" == *-e2e || "$BRANCH" == e2e ]]; then
        # Update e2e environment variables
        if [[ $PACKAGE == "meditrak-server" || $PACKAGE == "web-config-server" ]]; then
            sed -i -E 's/^AGGREGATION_URL_PREFIX="?dev-"?$/AGGREGATION_URL_PREFIX=e2e-/g' .env
        fi
    fi

    # If it's a server, start it running on pm2, otherwise build it
    echo "Preparing to start or build ${PACKAGE}"
    if [[ $PACKAGE == *server ]]; then
        # It's a server, start the pm2 process
        echo "Starting ${PACKAGE}"
        yarn build

        REPLICATION_PM2_CONFIG=''
        if [[ $PACKAGE == "web-config-server" ]]; then
            # as many replicas as cpu cores - 1
            REPLICATION_PM2_CONFIG='-i -1'
        fi

        pm2 start --name $PACKAGE dist --wait-ready --listen-timeout 15000 --time $REPLICATION_PM2_CONFIG
    else
        # It's a static package, build it
        echo "Building ${PACKAGE}"
        yarn build
    fi

    if [[ $PACKAGE == 'meditrak-server' ]]; then
        # reset cwd back to `/tupaia`
        cd ${HOME_DIRECTORY}

        # now that meditrak-server is up and listening for changes, we can run any migrations
        # if run earlier when meditrak-server isn't listening, changes will be missed from the
        # sync queues
        echo "Migrating the database"
        yarn migrate

        # After running migrations it's good to ensure that the analytics table is fully built
        yarn download-parameter-store-env-vars --package-name data-api --environment $ENVIRONMENT
        echo "Building analytics table"
        yarn workspace @tupaia/data-api install-mv-refresh
        yarn workspace @tupaia/data-api build-analytics-table
    fi
done

echo "Finished deploying latest"
