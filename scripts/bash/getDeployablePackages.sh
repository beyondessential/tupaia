#!/usr/bin/env bash
set -e

DEPLOYABLE_PACKAGES=(
    'admin-panel'
    'lesmis'
    'psss'
    'datatrak-web'
    'tupaia-web'
    'central-server'
    'data-table-server'
    'datatrak-web-server'
    'entity-server'
    'lesmis-server'
    'meditrak-app-server'
    'psss-server'
    'report-server'
    'tupaia-web-server'
    'web-config-server'
    'admin-panel-server' # admin-panel-server last as it depends on report-server
    'sync-server'
)
echo "${DEPLOYABLE_PACKAGES[@]}"

exit 0
