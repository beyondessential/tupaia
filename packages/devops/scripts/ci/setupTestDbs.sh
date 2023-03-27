#!/bin/bash -e

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"

set -x

./waitForPostgres.sh
yarn workspace @tupaia/database setup-test-database
yarn workspace @tupaia/data-lake-api setup-test-data-lake

echo Test dbs successfully set up
