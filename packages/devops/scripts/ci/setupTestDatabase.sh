#!/bin/bash -e
DIR=$(dirname "$0")
${DIR}/waitForPostgres.sh

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

psql -h $CI_TEST_DB_URL -p $DB_PORT -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD '$DB_PG_PASSWORD'"
psql -h $CI_TEST_DB_URL -p $DB_PORT -U postgres -d postgres -c "CREATE ROLE $CI_TEST_DB_USER LOGIN SUPERUSER PASSWORD '$CI_TEST_DB_PASSWORD'"
psql -h $CI_TEST_DB_URL -p $DB_PORT -U postgres -d postgres -c "CREATE DATABASE $CI_TEST_DB_NAME WITH OWNER $CI_TEST_DB_USER"
PGPASSWORD=$CI_TEST_DB_PASSWORD psql -h $CI_TEST_DB_URL -p $DB_PORT -U $CI_TEST_DB_USER -d $CI_TEST_DB_NAME -f ./packages/database/src/tests/testData/testDataDump.sql

echo "Installing mvrefresh"
DB_URL=$CI_TEST_DB_URL DB_PORT=$DB_PORT DB_NAME=$CI_TEST_DB_NAME DB_USER=$CI_TEST_DB_USER DB_PASSWORD=$CI_TEST_DB_PASSWORD DB_PG_USER=$DB_PG_USER DB_PG_PASSWORD=$DB_PG_PASSWORD DB_MV_USER=$DB_MV_USER DB_MV_PASSWORD=$DB_MV_PASSWORD yarn workspace @tupaia/data-api install-mv-refresh
echo "Patching mvrefresh"
DB_URL=$CI_TEST_DB_URL DB_PORT=$DB_PORT DB_NAME=$CI_TEST_DB_NAME DB_USER=$CI_TEST_DB_USER DB_PASSWORD=$CI_TEST_DB_PASSWORD DB_PG_USER=$DB_PG_USER DB_PG_PASSWORD=$DB_PG_PASSWORD DB_MV_USER=$DB_MV_USER DB_MV_PASSWORD=$DB_MV_PASSWORD yarn workspace @tupaia/data-api patch-mv-refresh up
echo "Installing Analytics table"
DB_URL=$CI_TEST_DB_URL DB_PORT=$DB_PORT DB_NAME=$CI_TEST_DB_NAME DB_USER=$CI_TEST_DB_USER DB_PASSWORD=$CI_TEST_DB_PASSWORD DB_PG_USER=$DB_PG_USER DB_PG_PASSWORD=$DB_PG_PASSWORD DB_MV_USER=$DB_MV_USER DB_MV_PASSWORD=$DB_MV_PASSWORD yarn workspace @tupaia/data-api build-analytics-table

echo "Deleting migrations that target data modifications, as there is no data to migrate on the test database"
rm packages/database/src/migrations/*modifies-data.js
yarn migrate
