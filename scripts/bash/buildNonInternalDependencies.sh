#!/usr/bin/env bash
set -ex

yarn workspaces foreach \
    --worktree \
    --parallel \
    --topological \
    --verbose --verbose \
    --jobs 5 \
    --include '@tupaia/{admin-panel-server,central-server,data-table-server,datatrak-web,datatrak-web-server,entity-server,sync-server,lesmis,lesmis-server,meditrak-app-server,psss,psss-server,report-server,tupaia-web,tupaia-web-server,web-config-server}' \
    run build \
    "$@"
