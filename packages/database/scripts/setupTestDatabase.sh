#!/bin/bash -e

DIR=$(pwd "$0")
source $DIR/../../scripts/bash/mergeCurrentEnvWithEnvFile.sh 

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

TUPAIA_USER_EXISTS=`PGPASSWORD=$DB_PG_PASSWORD psql -p $DB_PORT -X -A -h $DB_URL -U $DB_PG_USER -t -c "SELECT rolname FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER'"`

if [ -z "$TUPAIA_USER_EXISTS" ]; then
    PGPASSWORD=$DB_PG_PASSWORD psql -h $DB_URL -p $DB_PORT -U $DB_PG_USER -c "CREATE ROLE $DB_USER LOGIN SUPERUSER PASSWORD '$DB_PASSWORD'"
fi

PGPASSWORD=$DB_PG_PASSWORD psql -h $DB_URL -p $DB_PORT -U $DB_PG_USER -c "DROP DATABASE IF EXISTS $DB_NAME"
PGPASSWORD=$DB_PG_PASSWORD psql -h $DB_URL -p $DB_PORT -U $DB_PG_USER -c "CREATE DATABASE $DB_NAME WITH OWNER $DB_USER"
PGPASSWORD=$DB_PG_PASSWORD psql -h $DB_URL -p $DB_PORT -U $DB_PG_USER -c "ALTER USER $DB_USER WITH SUPERUSER"
PGPASSWORD=$DB_PASSWORD psql -h $DB_URL -p $DB_PORT -U $DB_USER -d $DB_NAME -f ./src/tests/testData/testDataDump.sql
PGPASSWORD=$DB_PG_PASSWORD psql -h $DB_URL -p $DB_PORT -U $DB_PG_USER -c "ALTER USER $DB_USER WITH NOSUPERUSER"

echo "Installing mvrefresh"
DB_NAME=$DB_NAME yarn workspace @tupaia/data-api install-mv-refresh
echo "Patching mvrefresh"
DB_NAME=$DB_NAME yarn workspace @tupaia/data-api patch-mv-refresh up
echo "Installing Analytics table"
DB_NAME=$DB_NAME yarn workspace @tupaia/data-api build-analytics-table

echo "Deleting migrations that target data modifications, as there is no data to migrate on the test database"
rm -rf ./src/migrations-backup
mkdir  ./src/migrations-backup
cp -r ./src/migrations/* ./src/migrations-backup/
rm ./src/migrations/*modifies-data.js
DB_NAME=$DB_NAME yarn migrate
cp -r ./src/migrations-backup/* ./src/migrations/
rm -rf ./src/migrations-backup
