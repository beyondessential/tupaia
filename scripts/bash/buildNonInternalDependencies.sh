#!/usr/bin/env bash
set -ex

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
vcpu_count=$("$script_dir/getVcpuCount.sh")

yarn workspaces foreach \
    --worktree \
    --parallel \
    --topological \
    --verbose --verbose \
    --jobs "$vcpu_count" \
    --include '@tupaia/{admin-panel-server,central-server,data-table-server,datatrak-web,datatrak-web-server,entity-server,sync-server,lesmis,lesmis-server,meditrak-app-server,psss,psss-server,report-server,tupaia-web,tupaia-web-server,web-config-server}' \
    run build \
    "$@"
