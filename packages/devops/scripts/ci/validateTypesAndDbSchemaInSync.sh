#!/usr/bin/env bash
set -ex

script_dir=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
root_dir="$script_dir"/../../../..

# Load environment variables from .env files
source "$root_dir"/scripts/bash/mergeEnvForDB.sh
cd "$root_dir"

echo "Connected to postgres server: $DB_URL, starting to setup database"

if [[ $CI = true ]]; then
    echo '::group::Set up test database'
fi

yarn workspace @tupaia/database setup-test-database

if [[ $CI = true ]]; then
    echo '::endgroup::'
fi

# Run check
yarn workspace @tupaia/types assert-no-changes
