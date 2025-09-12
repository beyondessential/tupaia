#!/usr/bin/env bash
set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
tupaia_dir=$(realpath -- "$script_dir"/../../../..)

# Initialise NVM (which sets the path for access to npm, yarn etc. as well)
. "$HOME"/.nvm/nvm.sh

get_backend_packages() {
    readarray -t deployable_packages < <("$tupaia_dir"/scripts/bash/getDeployablePackages.sh)
    local filtered=()
    for package in "${deployable_packages[@]}"; do
        if [[ $package = *-server ]]; then
            filtered+=("$package")
        fi
    done
    printf '%s\n' "${filtered[@]}"
}

set_up_central_server() {
    # Ensure the analytics table is fully built
    echo "Building analytics table"
    yarn workspace @tupaia/data-api install-mv-refresh
    yarn workspace @tupaia/data-api patch-mv-refresh up
    yarn workspace @tupaia/data-api build-analytics-table

    # ensure that the latest permissions based meditrak sync queue has been built
    yarn workspace @tupaia/central-server create-meditrak-sync-view
}

readarray -t backend_packages < <(get_backend_packages)

# Start back end server packages
for package in "${backend_packages[@]}"; do
    if [[ $package = central-server ]]; then
        set_up_central_server
    fi

    instances_flag=()
    if [[ $package = web-config-server || $package = report-server ]]; then
        # as many replicas as cpu cores - 1
        instances_flag=(--instances -1)
    fi

    # Some `Link` headers for from GET requests can be huge (over 24KiB) if they include a large
    # `filter` query parameter, which can be repeated several times over with different `page`s.
    # See `generateLinkHeader` from /packages/central-server/src/apiV2/GETHandler/helpers.js
    node_args_flag=()
    if [[ $package = central-server || $package = tupaia-web-server ]]; then
        node_args_flag=(--node-args '--max-http-header-size=32768')
    fi

    echo "Starting $package..."
    set -x
    pm2 start \
        --name "$package" \
        --wait-ready \
        --listen-timeout 15000 \
        "${instances_flag[@]}" \
        "${node_args_flag[@]}" \
        --time \
        "$tupaia_dir/packages/$package/dist"
    set +x
done

# get pm2 to restart all processes on boot
setup_startup_command=$(pm2 startup ubuntu -u ubuntu --hp /home/ubuntu | tail -1)
eval "$setup_startup_command"
pm2 save

# Log dump file
grep status /home/ubuntu/.pm2/dump.pm2

echo 'Finished deploying latest'
