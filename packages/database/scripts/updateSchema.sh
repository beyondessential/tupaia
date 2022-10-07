#!/bin/bash -e

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"
cd ..

if [ "$1" != "OK" ]; then
  echo "Warning, rebuild of analytics table will take a while, run with OK to proceed"
  exit 1;
fi

set -x

source ../../scripts/bash/mergeCurrentEnvWithEnvFile.sh

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

# Drop materialized views
yarn workspace @tupaia/data-api drop-analytics-table
yarn workspace @tupaia/data-api uninstall-mv-refresh

# Dump
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_URL -p $DB_PORT -U $DB_USER -O --schema public $EXCLUDETABLE -s $DB_NAME > "schema/schema.sql"
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_URL -p $DB_PORT -U $DB_USER -O --schema public $EXCLUDETABLE -c -t migrations $DB_NAME >> "schema/schema.sql"

# Reinstall materialized views
yarn workspace @tupaia/data-api install-mv-refresh
yarn workspace @tupaia/data-api build-analytics-table

echo "Done"