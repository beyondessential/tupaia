#!/bin/bash
source .env
git submodule update --init scripts/pg-mv-fast-refresh
cd scripts/pg-mv-fast-refresh/
export DB_MV_HOME="$PWD"
(. runCreateFastRefreshModule.sh)
cd ..
export PGPASSWORD=$DB_PG_PASSWORD
psql --set=db_user="$DB_USER" --set=mv_user="$DB_MV_USER" -h $DB_URL -d $DB_NAME -U $DB_PG_USER -f grantMvRefreshPermissions.sql