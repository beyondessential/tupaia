#!/bin/bash -e
DIR=$(dirname "$0")
${DIR}/waitForPostgres.sh

echo "Connected to postgres server: $DB_URL, starting to setup database"
yarn workspace @tupaia/database setup-test-database
echo "starting to setup data-lake"
yarn workspace @tupaia/data-lake-api setup-test-data-lake

PACKAGE=$1
yarn workspace @tupaia/${PACKAGE} test
