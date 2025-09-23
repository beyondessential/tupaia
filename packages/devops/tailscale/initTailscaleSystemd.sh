#!/usr/bin/env bash
set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
tupaia_dir=$(realpath -- "$script_dir"/../../../..)

sudo cp "$script_dir"/tailscale-connect.service /etc/systemd/system/tailscale-connect.service

sudo systemctl start tailscale-connect
sudo systemctl enable myfirst
