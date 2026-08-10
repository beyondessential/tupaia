#!/usr/bin/env bash
set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
tupaia_dir=$(realpath -- "$script_dir"/../../../..)
pm2_ecosystem=$tupaia_dir/packages/devops/configs/pm2/deployment.config.js

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
    # Run database migrations, so central-server can signal ready to pm2 as soon as it has started
    echo "Running database migrations"
    yarn workspace @tupaia/database migrate

    # Ensure the analytics table is fully built
    echo "Building analytics table"
    yarn workspace @tupaia/data-api install-mv-refresh
    yarn workspace @tupaia/data-api patch-mv-refresh up
    yarn workspace @tupaia/data-api build-analytics-table

    # ensure that the latest permissions based meditrak sync queue has been built
    yarn workspace @tupaia/central-server create-meditrak-sync-view
}

start_package() {
    echo "Starting $1..."
    pm2 start "$pm2_ecosystem" --only "$1" &
    start_pids+=($!)
}

readarray -t backend_packages < <(get_backend_packages)

# Spawn the PM2 daemon up front so the parallel start jobs below don’t race to create it
pm2 ping

# Set up central-server in background...
set_up_central_server &
central_server_setup_pid=$!

# ...while starting the other servers...
start_pids=()
for package in "${backend_packages[@]}"; do
    if [[ $package != central-server ]]; then
        start_package "$package"
    fi
done

# ...then start central-server.
wait "$central_server_setup_pid"
start_package central-server

declare -i start_failed=0
for pid in "${start_pids[@]}"; do
    wait "$pid" || start_failed=1
done
if ((start_failed)); then
    echo "One or more backend servers failed to start" >&2
    exit 1
fi

# get pm2 to restart all processes on boot
setup_startup_command=$(pm2 startup ubuntu -u ubuntu --hp /home/ubuntu | tail -1)
eval "$setup_startup_command"
pm2 save

# Log dump file
grep status /home/ubuntu/.pm2/dump.pm2

echo "Finished deploying latest"
