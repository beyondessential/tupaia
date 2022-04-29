#!/bin/bash -le

DIR=$(dirname "$0")
TUPAIA_DIR=$DIR/../../../..
PACKAGES=$(${TUPAIA_DIR}/scripts/bash/getDeployablePackages.sh)

# Initialise NVM (which sets the path for access to npm, yarn etc. as well)
. $HOME/.nvm/nvm.sh

# Start back end server packages
for PACKAGE in ${PACKAGES[@]}; do
    if [[ $PACKAGE == *server ]]; then
        # It's a server, start the pm2 process
        echo "Starting ${PACKAGE}"
        cd ${TUPAIA_DIR}/packages/$PACKAGE
        REPLICATION_PM2_CONFIG=''
        if [ $PACKAGE == "web-config-server" ] || [ $PACKAGE == "report-server" ]; then
            # as many replicas as cpu cores - 1
            REPLICATION_PM2_CONFIG='-i -1'
        fi
        pm2 start --name $PACKAGE dist --wait-ready --listen-timeout 15000 --time $REPLICATION_PM2_CONFIG

        if [[ $PACKAGE == 'central-server' ]]; then
            # reset cwd back to `/tupaia`
            cd ${TUPAIA_DIR}

            # ensure that the analytics table is fully built
            echo "Building analytics table"
            yarn workspace @tupaia/data-api install-mv-refresh
            yarn workspace @tupaia/data-api patch-mv-refresh up
            yarn workspace @tupaia/data-api build-analytics-table
        fi
    fi
done

# get pm2 to restart all processes on boot
setup_startup_command=$(pm2 startup ubuntu -u ubuntu --hp /home/ubuntu | tail -1)
eval "$setup_startup_command"
pm2 save

echo "Finished deploying latest"
