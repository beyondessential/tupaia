#!/bin/bash -e
DIR=$(dirname "$0")
${DIR}/waitForPostgres.sh

echo "Connected to postgres server: $DB_URL, starting to setup database"
yarn setup-test-database

PACKAGE=$1
yarn workspace @tupaia/${PACKAGE} test
