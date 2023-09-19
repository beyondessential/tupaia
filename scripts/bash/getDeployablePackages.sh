#!/bin/bash -e

# meditrak-app-server before central-server so that the meditrak-sync-queue is listening before we run the migrations
# admin-panel-server last as it depends on report-server
echo "admin-panel" "lesmis" "psss" "datatrak-web" "tupaia-web" "web-frontend" "meditrak-app-server" "central-server" "data-table-server" "datatrak-web-server" "entity-server" "lesmis-server" "psss-server" "report-server" "tupaia-web-server" "web-config-server" "admin-panel-server"
exit 0
