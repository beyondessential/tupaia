#!/bin/bash

DIR=$(pwd "$0")
source "$DIR/../../scripts/bash/mergeEnvForDB.sh" 

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

export PGPASSWORD=$DB_PG_PASSWORD
MV_REFRESH_EXISTS=$(psql -p "$DB_PORT" -X -A -h "$DB_URL" -d "$DB_NAME" -U "$DB_PG_USER" -t -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name = '$DB_MV_USER'")

if [[ $MV_REFRESH_EXISTS = "$DB_MV_USER" ]]; then
    echo 'Fast Refresh module already exists, skipping installation'
else
    git submodule update --init scripts/pg-mv-fast-refresh
    cd scripts/pg-mv-fast-refresh/
    export DB_MV_HOME="$PWD"
    (. runCreateFastRefreshModule.sh)
    cd ../..
    git submodule deinit scripts/pg-mv-fast-refresh
fi

export PGPASSWORD=$DB_PG_PASSWORD
psql -p "$DB_PORT" --set=db_user="$DB_USER" --set=mv_user="$DB_MV_USER" --set=db_name="$DB_NAME" -h "$DB_URL" -d "$DB_NAME" -U "$DB_PG_USER" -f scripts/grantMvRefreshPermissions.sql
