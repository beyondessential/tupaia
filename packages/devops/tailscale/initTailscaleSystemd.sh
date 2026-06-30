#!/usr/bin/env bash
set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

sudo cp "$script_dir"/tailscale-connect.service /etc/systemd/system/tailscale-connect.service

sudo systemctl daemon-reload
sudo systemctl enable tailscale-connect.service
sudo systemctl start tailscale-connect.service
