#!/usr/bin/env bash -ex

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
root_dir=$(realpath -- "$script_dir"/../../../..)

source "$root_dir"/scripts/bash/mergeEnvForDB.sh
cd "$root_dir"

echo "Connected to PostgreSQL server: $DB_URL, starting to setup database"
yarn workspace @tupaia/database setup-test-database

# Run check
yarn workspace @tupaia/types assert-no-changes
