#!/bin/bash -e
DIR=$(dirname "$0")
${DIR}/waitForPostgres.sh

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

psql -h $DB_URL -p $DB_PORT -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD '$DB_PG_PASSWORD'"
psql -h $DB_URL -p $DB_PORT -U postgres -d postgres -c "CREATE ROLE $DB_USER LOGIN SUPERUSER PASSWORD '$DB_PASSWORD'"
psql -h $DB_URL -p $DB_PORT -U postgres -d postgres -c "CREATE DATABASE $DB_NAME WITH OWNER $DB_USER"
PGPASSWORD=$DB_PASSWORD psql -h $DB_URL -p $DB_PORT -U $DB_USER -d $DB_NAME -f ./packages/database/src/tests/testData/testDataDump.sql

echo "Installing mvrefresh"
yarn workspace @tupaia/data-api install-mv-refresh
echo "Patching mvrefresh"
yarn workspace @tupaia/data-api patch-mv-refresh up
echo "Installing Analytics table"
yarn workspace @tupaia/data-api build-analytics-table

echo "Deleting migrations that target data modifications, as there is no data to migrate on the test database"
rm packages/database/src/migrations/*modifies-data.js
yarn migrate
