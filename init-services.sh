#!/bin/bash
set -x

PACKAGES=("meditrak-server" "web-config-server" "psss-server" "lesmis-server" "report-server" "entity-server" "web-frontend" "admin-panel" "psss" "lesmis")

HOME_DIRECTORY=/tupaia

for PACKAGE in ${PACKAGES[@]}; do
    echo "Preparing to start ${PACKAGE}"

    cd ${HOME_DIRECTORY}/packages/$PACKAGE

    if [[ $PACKAGE == *server ]]; then
        echo "Starting ${PACKAGE}"
        pm2 start --name $PACKAGE dist --wait-ready --listen-timeout 15000 --time
    fi
done

echo "Services started"
