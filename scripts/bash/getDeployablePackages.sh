#!/usr/bin/env bash
set -e

deployable_packages=(
    admin-panel-server
    admin-panel
    central-server
    data-table-server
    datatrak-web-server
    datatrak-web
    entity-server
    lesmis-server
    lesmis
    meditrak-app-server
    psss-server
    psss
    report-server
    sync-server
    tupaia-web-server
    tupaia-web
    web-config-server
)

if [[ $1 = --as-glob ]]; then
    # ('foo' 'bar' 'baz') → 'foo,bar,baz'
    pattern=$(
        IFS=,
        echo "${deployable_packages[*]}"
    )
    # 'foo,bar,baz' → '{foo,bar,baz}'
    echo "{$pattern}"
else
    printf '%s\n' "${deployable_packages[@]}"
fi

exit 0
