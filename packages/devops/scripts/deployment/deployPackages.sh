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
for PACKAGE in ${PACKAGES[@]}; do
    if [[ $PACKAGE != *server ]]; then
        # It's a front end package, build it
        REACT_APP_BRANCH=${BRANCH} yarn workspace @tupaia/${PACKAGE} build
    fi
done

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
