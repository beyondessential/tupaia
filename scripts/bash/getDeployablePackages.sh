#!/bin/bash -e

# meditrak-app-server before central-server so that the meditrak-sync-queue is listening before we run the migrations
echo "admin-panel" "lesmis" "psss" "datatrak-web" "tupaia-web" "meditrak-app-server" "central-server" "data-table-server" "datatrak-web-server" "entity-server" "lesmis-server" "psss-server" "report-server" "tupaia-web-server" "web-config-server" "admin-panel-server" # admin-panel-server last as it depends on report-server
exit 0
