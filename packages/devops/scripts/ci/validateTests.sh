#!/usr/bin/env bash
set -e

DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
ROOT="$DIR/../../../../"

node "$ROOT/scripts/node/validateTests"
