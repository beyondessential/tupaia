#!/bin/bash -e

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR/.."

if [[ $1 != OK ]]; then
  echo 'Note: this script reads .env vars'
  echo '  Update DB_NAME etc... in database db.env'
  echo 
  echo 're-run with OK to continue'
  exit 1;
fi

if [[ $CI = true ]]; then
    echo '::group::Set up test database'
fi

declare -i tic=$SECONDS

DIR=$(pwd "$0")
source "$DIR/../../scripts/bash/mergeEnvForDB.sh" 

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

IS_RDS=$(PGPASSWORD="$DB_PG_PASSWORD" psql -qtAX -h "$DB_URL" -p "$DB_PORT" -U "$DB_PG_USER" -c "SELECT 1 FROM pg_roles WHERE rolname='rds_superuser'")

PGPASSWORD="$DB_PG_PASSWORD" psql -h "$DB_URL" -p "$DB_PORT" -U "$DB_PG_USER" -c "CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASSWORD'" || echo "Role $DB_USER already exists?"

# Temporarily grant DB_USER superuser access, to allow installing postgis and importing the schema
if [ "$IS_RDS" = "1" ]; then
  PGPASSWORD="$DB_PG_PASSWORD" psql -h "$DB_URL" -p "$DB_PORT" -U "$DB_PG_USER" -c "GRANT rds_superuser TO $DB_USER"
  PGPASSWORD="$DB_PG_PASSWORD" psql -h "$DB_URL" -p "$DB_PORT" -U "$DB_PG_USER" -c "GRANT $DB_USER TO postgres"
else
  PGPASSWORD="$DB_PG_PASSWORD" psql -h "$DB_URL" -p "$DB_PORT" -U "$DB_PG_USER" -c "ALTER USER $DB_USER WITH SUPERUSER"
fi

PGPASSWORD="$DB_PG_PASSWORD" psql -h "$DB_URL" -p "$DB_PORT" -U "$DB_PG_USER" -c "CREATE ROLE tupaia_read PASSWORD '$DB_PASSWORD'" || echo "Role tupaia_read already exists?"
PGPASSWORD="$DB_PG_PASSWORD" psql -h "$DB_URL" -p "$DB_PORT" -U "$DB_PG_USER" -c "CREATE DATABASE $DB_NAME WITH OWNER $DB_USER"
PGPASSWORD="$DB_PG_PASSWORD" psql -h "$DB_URL" -p "$DB_PORT" -U "$DB_PG_USER" "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS postgis"
PGPASSWORD=$DB_PASSWORD psql -h "$DB_URL" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f schema/schema.sql

if [ "$IS_RDS" = "1" ]; then
  PGPASSWORD="$DB_PG_PASSWORD" psql -h "$DB_URL" -p "$DB_PORT" -U "$DB_PG_USER" -c "REVOKE rds_superuser FROM $DB_USER"
else
  PGPASSWORD="$DB_PG_PASSWORD" psql -h "$DB_URL" -p "$DB_PORT" -U "$DB_PG_USER" -c "ALTER USER $DB_USER WITH NOSUPERUSER"
fi

set +x

echo "Installing mvrefresh"
DB_NAME="$DB_NAME" yarn workspace @tupaia/data-api install-mv-refresh
echo "Patching mvrefresh"
DB_NAME="$DB_NAME" yarn workspace @tupaia/data-api patch-mv-refresh up
echo "Installing Analytics table"
DB_NAME="$DB_NAME" yarn workspace @tupaia/data-api build-analytics-table

echo "Deleting migrations that target data modifications, as there is no data to migrate in the new database"
rm -rf ./src/migrations-backup
mkdir  ./src/migrations-backup
cp -r ./src/migrations/* ./src/migrations-backup/
rm ./src/migrations/*modifies-data.js
DB_NAME="$DB_NAME" yarn migrate
cp -r ./src/migrations-backup/* ./src/migrations/
rm -rf ./src/migrations-backup

if [[ $CI = true ]]; then
    echo '::endgroup::'
fi

declare -i toc=$SECONDS
echo "Set up test database in $((toc - tic)) s"
