#!/bin/bash
DIR=`dirname "$0"`
${DIR}/waitForPostgres.sh
psql -h $CI_TEST_DB_URL -p 5432 -U postgres -d postgres -c "CREATE ROLE $CI_TEST_DB_USER LOGIN SUPERUSER PASSWORD '$CI_TEST_DB_PASSWORD'"
psql -h $CI_TEST_DB_URL -p 5432 -U postgres -d postgres -c "CREATE DATABASE $CI_TEST_DB_NAME WITH OWNER $CI_TEST_DB_USER"
PGPASSWORD=$CI_TEST_DB_PASSWORD psql -h $CI_TEST_DB_URL -p 5432 -U $CI_TEST_DB_USER -d $CI_TEST_DB_NAME -f ./packages/database/src/tests/testData/testDataDump.sql
echo "Deleting migrations that target data modifications, as there is no data to migrate on the test database"
rm packages/database/src/migrations/*modifies-data.js
yarn migrate
