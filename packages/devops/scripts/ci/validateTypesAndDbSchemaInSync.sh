#!/usr/bin/env bash

set -ex

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
root_dir=$(realpath -- "$script_dir"/../../../..)

if [[ $CI = true ]]; then
    echo '::group::Load environment variables from .env files'
fi
source "$root_dir"/scripts/bash/mergeEnvForDB.sh
if [[ $CI = true ]]; then
    echo '::endgroup::'
fi

cd "$root_dir"

echo "Connected to PostgreSQL server: $DB_URL, starting to set up database"

yarn workspace @tupaia/database setup-test-database

# Run check
yarn workspace @tupaia/types assert-no-changes
