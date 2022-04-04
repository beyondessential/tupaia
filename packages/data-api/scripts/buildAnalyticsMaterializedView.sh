#!/bin/bash -e

# if env vars are not already defined (e.g. by script caller during CI/CD), pull them in from .env
if [ "$DB_URL" == "" ]; then
    source .env
fi

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"
DB_NAME="$DB_NAME" && [[ "$USE_TEST_DB" != "" ]] && DB_NAME=$TEST_DB_NAME

cd scripts
export PGPASSWORD=$DB_PASSWORD
if [[ "$1" == "--force" || "$1" == "-f" ]]; then
  psql -p $DB_PORT -h $DB_URL -d $DB_NAME -U $DB_USER -tc "SELECT build_analytics_table(true);"
else
  psql -p $DB_PORT -h $DB_URL -d $DB_NAME -U $DB_USER -tc "SELECT build_analytics_table();"
fi
psql -p $DB_PORT -h $DB_URL -d $DB_NAME -U $DB_USER -tc "SELECT create_analytics_table_indexes();"
