#!/usr/bin/env bash
set -e

DEPLOYABLE_PACKAGES=(
    'admin-panel-server'
    'admin-panel'
    'central-server'
    'data-table-server'
    'datatrak-web-server'
    'datatrak-web'
    'entity-server'
    'lesmis-server'
    'lesmis'
    'meditrak-app-server'
    'psss-server'
    'psss'
    'report-server'
    'tupaia-web-server'
    'tupaia-web'
    'web-config-server'
)
echo "${DEPLOYABLE_PACKAGES[@]}"

exit 0
