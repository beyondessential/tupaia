#!/usr/bin/env bash
set -e

FLAG=$1 # Optional --glob flag

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

if [[ $FLAG = --glob ]]; then
    # ('foo' 'bar' 'baz') → 'foo,bar,baz'
    PATTERN=$(
        IFS=,
        echo "${DEPLOYABLE_PACKAGES[*]}"
    )
    # 'foo,bar,baz' → '@tupaia/{foo,bar,baz}'
    echo "@tupaia/{$PATTERN}"
else
    echo "${DEPLOYABLE_PACKAGES[@]}"
fi

exit 0
