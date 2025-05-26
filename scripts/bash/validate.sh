#!/usr/bin/env bash
set -e

DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
. "$DIR/../../packages/devops/scripts/ci/utils.sh"

yarn workspace @tupaia/devops validate-branch-name
yarn workspace @tupaia/devops validate-tests
