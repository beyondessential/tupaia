#!/bin/bash -e
DIR=$(dirname "$0")
${DIR}/waitForPostgres.sh

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

PGPASSWORD=$DB_PG_PASSWORD psql -h $DB_URL -p $DB_PORT -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD '$DB_PG_PASSWORD'"
PGPASSWORD=$DB_PG_PASSWORD psql -h $DB_URL -p $DB_PORT -U postgres -d postgres -c "CREATE ROLE $DB_USER LOGIN SUPERUSER PASSWORD '$DB_PASSWORD'"
PGPASSWORD=$DB_PG_PASSWORD psql -h $DB_URL -p $DB_PORT -U postgres -d postgres -c "DROP DATABASE IF EXISTS $TEST_DB_NAME"
PGPASSWORD=$DB_PG_PASSWORD psql -h $DB_URL -p $DB_PORT -U postgres -d postgres -c "CREATE DATABASE $TEST_DB_NAME WITH OWNER $DB_USER"
PGPASSWORD=$DB_PASSWORD psql -h $DB_URL -p $DB_PORT -U $DB_USER -d $TEST_DB_NAME -f ./packages/database/src/tests/testData/testDataDump.sql

echo "Installing mvrefresh"
USE_TEST_DB=true yarn workspace @tupaia/data-api install-mv-refresh
echo "Patching mvrefresh"
USE_TEST_DB=true yarn workspace @tupaia/data-api patch-mv-refresh up
echo "Installing Analytics table"
USE_TEST_DB=true yarn workspace @tupaia/data-api build-analytics-table

echo "Deleting migrations that target data modifications, as there is no data to migrate on the test database"
rm packages/database/src/migrations/*modifies-data.js
USE_TEST_DB=true yarn migrate
git checkout -- 'packages/database/src/migrations/*modifies-data.js'
