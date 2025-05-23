#!/usr/bin/env bash
set -e

DIR=$(pwd "$0")
. "$DIR/../../scripts/bash/mergeEnvForDB.sh"

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

cd scripts
export PGPASSWORD=$DB_PASSWORD
if [[ $1 = '--force' || $1 = '-f' ]]; then
    psql -p "$DB_PORT" -h "$DB_URL" -d "$DB_NAME" -U "$DB_USER" -tc "SELECT build_analytics_table(true);"
else
    psql -p "$DB_PORT" -h "$DB_URL" -d "$DB_NAME" -U "$DB_USER" -tc "SELECT build_analytics_table();"
fi
psql -p "$DB_PORT" -h "$DB_URL" -d "$DB_NAME" -U "$DB_USER" -tc "SELECT create_analytics_table_indexes();"
