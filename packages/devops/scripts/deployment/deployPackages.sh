#!/bin/bash -le

DIR=$(dirname "$0")
TUPAIA_DIR=$DIR/../../../..
BRANCH=$1
PACKAGES=$(${TUPAIA_DIR}/scripts/bash/getDeployablePackages.sh)

# Initialise NVM (which sets the path for access to npm, yarn etc. as well)
. $HOME/.nvm/nvm.sh

# Install external dependencies and build internal dependencies
cd ${TUPAIA_DIR}
yarn install

# Inject environment variables from LastPass
LASTPASS_EMAIL=$($DIR/fetchParameterStoreValue.sh LASTPASS_EMAIL)
LASTPASS_PASSWORD=$($DIR/fetchParameterStoreValue.sh LASTPASS_PASSWORD)
LASTPASS_EMAIL=$LASTPASS_EMAIL LASTPASS_PASSWORD=$LASTPASS_PASSWORD yarn download-env-vars $BRANCH

# Build each front end package
CONCURRENT_BUILD_BATCH_SIZE=2
front_end_build_commands=()
for PACKAGE in ${PACKAGES[@]}; do
    if [[ $PACKAGE != *server ]]; then
        # It's a front end package, add the build command
        if [[ $PACKAGE == "web-frontend" ]]; then
            # The package web-frontend has a desktop and a mobile version, build both
            front_end_build_commands+=("\"REACT_APP_BRANCH=${BRANCH} BUILD_PATH=/build/desktop mkdir -p build/desktop && yarn workspace @tupaia/web-frontend build-desktop\"")
            front_end_build_commands+=("\"REACT_APP_BRANCH=${BRANCH} BUILD_PATH=/build/mobile mkdir -p build/mobile && yarn workspace @tupaia/web-frontend build-mobile\"")
        else
            front_end_build_commands+=("\"REACT_APP_BRANCH=${BRANCH} yarn workspace @tupaia/${PACKAGE} build\"")
        fi
    fi
done

echo "Concurrently front end packages in batches of ${CONCURRENT_BUILD_BATCH_SIZE}"
total_build_commands=${#front_end_build_commands[@]}
for ((start_index = 0; start_index < ${total_build_commands}; start_index += ${CONCURRENT_BUILD_BATCH_SIZE})); do
    echo "yarn concurrently ${front_end_build_commands[@]:${start_index}:${CONCURRENT_BUILD_BATCH_SIZE}}"
    eval "yarn concurrently ${front_end_build_commands[@]:${start_index}:${CONCURRENT_BUILD_BATCH_SIZE}}"
done

for PACKAGE in ${PACKAGES[@]}; do
    if [[ $PACKAGE != *server ]]; then
        # It's a front end package, build it in the background
        echo "Building ${PACKAGE}"
        cd ${TUPAIA_DIR}/packages/$PACKAGE
        if [[ $PACKAGE == "web-frontend" ]]; then
            # The package web-frontend has a desktop and a mobile version, build both in background

            # Build desktop version
            REACT_APP_BRANCH=${BRANCH} BUILD_PATH=/build/desktop mkdir -p build/desktop && yarn build-desktop &
            front_end_build_pids[${i}]=$!
            front_end_build_index=front_end_build_index+1

            # Build mobile version
            REACT_APP_BRANCH=${BRANCH} BUILD_PATH=/build/mobile mkdir -p build/mobile && yarn build-mobile &
            front_end_build_pids[${i}]=$!
            front_end_build_index=front_end_build_index+1
        else
            # Build package in background
            REACT_APP_BRANCH=${BRANCH} yarn build &
            front_end_build_pids[${i}]=$!
            front_end_build_index=front_end_build_index+1
        fi
    fi

    # If we've already started a batch worth of builds, wait for those to finish before moving on,
    # lest we start too many and run out of memory
    if (( front_end_build_index > front_end_build_batch_size - 1 )); then
        for pid in ${front_end_build_pids[*]}; do
            wait $pid
        done
        front_end_build_pids=()
        front_end_build_index=0
    fi
done

# If there are any front end builds active, wait for them to complete
if (( front_end_build_index > 0 )); then
    for pid in ${front_end_build_pids[*]}; do
        wait $pid
    done
fi

# Build and start back end server packages
for PACKAGE in ${PACKAGES[@]}; do
    if [[ $PACKAGE == *server ]]; then
        # It's a server, start the pm2 process
        echo "Building ${PACKAGE}"
        cd ${TUPAIA_DIR}/packages/$PACKAGE
        yarn build

        echo "Starting ${PACKAGE}"
        REPLICATION_PM2_CONFIG=''
        if [[ $PACKAGE == "web-config-server" ]]; then
            # as many replicas as cpu cores - 1
            REPLICATION_PM2_CONFIG='-i -1'
        fi
        pm2 start --name $PACKAGE dist --wait-ready --listen-timeout 15000 --time $REPLICATION_PM2_CONFIG

        if [[ $PACKAGE == 'meditrak-server' ]]; then
            # reset cwd back to `/tupaia`
            cd ${TUPAIA_DIR}

            # now that meditrak-server is up and listening for changes, we can run any migrations
            # if run earlier when meditrak-server isn't listening, changes will be missed from the
            # sync queues
            echo "Migrating the database"
            yarn migrate

            # After running migrations it's good to ensure that the analytics table is fully built
            echo "Building analytics table"
            yarn workspace @tupaia/data-api install-mv-refresh
            yarn workspace @tupaia/data-api build-analytics-table
        fi
    fi
done

echo "Finished deploying latest"
