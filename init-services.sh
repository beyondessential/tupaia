#!/bin/bash
set -x

PACKAGES=("meditrak-server" "web-config-server" "psss-server" "lesmis-server" "report-server" "entity-server" "web-frontend" "admin-panel" "psss" "lesmis")

for PACKAGE in ${PACKAGES[@]}; do
    echo "Preparing to start ${PACKAGE}"
    if [[ $PACKAGE == *server ]]; then
        echo "Starting ${PACKAGE}"
        pm2 start --name $PACKAGE dist --wait-ready --listen-timeout 15000 --time
    fi
done

echo "Services started"
