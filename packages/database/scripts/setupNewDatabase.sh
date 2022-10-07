#!/bin/bash -xe

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"
cd ..

if [ "$1" != "OK" ]; then
  echo "Note: this script reads .env vars"
  echo "   [1] Update DB_NAME etc... in database .env"
  echo "   [2] Update DB_NAME etc... in data-api .env"
  echo ""
  echo "re-run with OK to continue"
  exit 1;
fi

source ../../scripts/bash/mergeCurrentEnvWithEnvFile.sh

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

set -x

PGPASSWORD=$DB_PG_PASSWORD psql -h $DB_URL -p $DB_PORT -U $DB_PG_USER -c "CREATE ROLE $DB_USER LOGIN SUPERUSER PASSWORD '$DB_PASSWORD'" || echo "Role $DB_USER already exists?"
PGPASSWORD=$DB_PG_PASSWORD psql -h $DB_URL -p $DB_PORT -U $DB_PG_USER -c "CREATE ROLE tupaia_read PASSWORD '$DB_PASSWORD'" || echo "Role tupaia_read already exists?"
PGPASSWORD=$DB_PG_PASSWORD psql -h $DB_URL -p $DB_PORT -U $DB_PG_USER -c "CREATE DATABASE $DB_NAME WITH OWNER $DB_USER"
PGPASSWORD=$DB_PG_PASSWORD psql -h $DB_URL -p $DB_PORT -U $DB_PG_USER $DB_NAME -c "CREATE EXTENSION postgis"
PGPASSWORD=$DB_PG_PASSWORD psql -h $DB_URL -p $DB_PORT -U $DB_PG_USER -c "ALTER USER $DB_USER WITH SUPERUSER"
PGPASSWORD=$DB_PASSWORD psql -h $DB_URL -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema/schema.sql
PGPASSWORD=$DB_PG_PASSWORD psql -h $DB_URL -p $DB_PORT -U $DB_PG_USER -c "ALTER USER $DB_USER WITH NOSUPERUSER"

set +x

echo "Installing mvrefresh"
DB_NAME=$DB_NAME yarn workspace @tupaia/data-api install-mv-refresh
echo "Patching mvrefresh"
DB_NAME=$DB_NAME yarn workspace @tupaia/data-api patch-mv-refresh up
echo "Installing Analytics table"
DB_NAME=$DB_NAME yarn workspace @tupaia/data-api build-analytics-table

echo "Deleting migrations that target data modifications, as there is no data to migrate in the new database"
rm -rf ./src/migrations-backup
mkdir  ./src/migrations-backup
cp -r ./src/migrations/* ./src/migrations-backup/
rm ./src/migrations/*modifies-data.js
DB_NAME=$DB_NAME yarn migrate
cp -r ./src/migrations-backup/* ./src/migrations/
rm -rf ./src/migrations-backup

echo "Done"