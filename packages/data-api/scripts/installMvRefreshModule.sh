#!/bin/bash
source .env

export PGPASSWORD=$DB_PG_PASSWORD
MV_REFRESH_EXISTS=`psql -X -A -h $DB_URL -d $DB_NAME -U $DB_PG_USER -t -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name = '$DB_MV_USER'"`

if [ "$MV_REFRESH_EXISTS" == "$DB_MV_USER" ]; then
    echo "Fast Refresh module already exists, skipping installation"
else
    git submodule update --init scripts/pg-mv-fast-refresh
    cd scripts/pg-mv-fast-refresh/
    export DB_MV_HOME="$PWD"
    (. runCreateFastRefreshModule.sh)
    cd ../..
fi

export PGPASSWORD=$DB_PG_PASSWORD
psql --set=db_user="$DB_USER" --set=mv_user="$DB_MV_USER" -h $DB_URL -d $DB_NAME -U $DB_PG_USER -f scripts/grantMvRefreshPermissions.sql