#!/usr/bin/env bash
set -e

DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

# Packages with .env files are (currently) all deployable, plus auth, data-api, and database
PACKAGES=$("$DIR/getDeployablePackages.sh")
PACKAGES+=('data-api' 'viz-test-tool')
echo "${PACKAGES[@]}"

exit 0
