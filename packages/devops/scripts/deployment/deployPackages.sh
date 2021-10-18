#!/bin/bash -le

# Kill all pm2 processes
echo "Existing processes:"
pm2 list
echo "Deleting existing backend processes..."
pm2 delete all || : # return 0 exit code even if delete failed because there were no running processes
echo "Deleting existing frontend builds..."
cd ${HOME_DIRECTORY}
# delete all "build" folders, which is where front ends are served from
find ./packages -type d -name "build" -maxdepth 2 -exec rm -rf {} \;


PACKAGES=$(${HOME_DIRECTORY}/scripts/bash/getDeployablePackages.sh)

# Set up .env to match the environment variables stored in LastPass
cd ${HOME_DIRECTORY}
LASTPASS_EMAIL=$LASTPASS_EMAIL LASTPASS_PASSWORD=$LASTPASS_PASSWORD yarn download-env-vars $BRANCH

# For each package, get the latest and deploy it
for PACKAGE in ${PACKAGES[@]}; do
    # reset cwd back to `/tupaia`
    cd ${HOME_DIRECTORY}

    cd ${HOME_DIRECTORY}/packages/$PACKAGE

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
        REACT_APP_BRANCH=${BRANCH} yarn build
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
        yarn download-env-vars $BRANCH data-api
        echo "Building analytics table"
        yarn workspace @tupaia/data-api install-mv-refresh
        yarn workspace @tupaia/data-api build-analytics-table
        yarn workspace @tupaia/data-api patch-analytics-table up
    fi
done

echo "Finished deploying latest"
