#!/usr/bin/env bash

set -ex

yarn workspaces foreach \
    --parallel \
    --topological \
    --verbose --verbose \
    --jobs unlimited \
    --include '@tupaia/{admin-panel-server,central-server,data-table-server,datatrak-web,datatrak-web-server,entity-server,lesmis,lesmis-server,meditrak-app-server,psss,psss-server,report-server,tupaia-web,tupaia-web-server,web-config-server}' \
    run build
