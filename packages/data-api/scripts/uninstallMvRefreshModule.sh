#!/usr/bin/env bash
set -e

DIR=$(pwd "$0")
. "$DIR/../../scripts/bash/mergeEnvForDB.sh"

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

export PGPASSWORD=$DB_PG_PASSWORD
MV_REFRESH_EXISTS=$(psql -X -A -p "$DB_PORT" -h "$DB_URL" -d "$DB_NAME" -U "$DB_PG_USER" -t -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name = '$DB_MV_USER'")

if [[ $MV_REFRESH_EXISTS != "$DB_MV_USER" ]]; then
    echo 'Fast Refresh module does not exist, skipping uninstallation'
else
    git submodule update --init scripts/pg-mv-fast-refresh
    cd scripts/pg-mv-fast-refresh/
    export DB_MV_HOME="$PWD"
    (. dropFastRefreshModule.sh)
    cd ../..
    git submodule deinit scripts/pg-mv-fast-refresh
    export PGPASSWORD=$DB_PG_PASSWORD
    psql -p "$DB_PORT" -h "$DB_URL" -d "$DB_NAME" -U "$DB_PG_USER" -tc "REVOKE ALL PRIVILEGES on schema public FROM $DB_MV_USER; DROP ROLE IF EXISTS $DB_MV_USER;"
fi
