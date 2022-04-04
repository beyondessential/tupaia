#!/bin/bash -e
source .env

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"
DB_NAME="$DB_NAME" && [[ "$USE_TEST_DB" != "" ]] && DB_NAME=$TEST_DB_NAME

cd scripts
export PGPASSWORD=$DB_PASSWORD
psql -p $DB_PORT -h $DB_URL -d $DB_NAME -U $DB_USER -tc "SELECT drop_analytics_table();"
psql -p $DB_PORT -h $DB_URL -d $DB_NAME -U $DB_USER -tc "SELECT drop_analytics_log_tables();"
