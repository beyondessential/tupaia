#!/bin/bash
set -x
#set -e # exit if any line fails

HOST=$1

if [ -z "$HOST" ]
then
      echo "Must pass DB_URL"
      exit 1;
fi

# Db
psql -h "$HOST" -U postgres -c "CREATE database $DB_NAME;"

# Roles
psql -h "$HOST" -U postgres -c "CREATE ROLE tupaia WITH LOGIN ENCRYPTED PASSWORD 'tupaia';"
psql -h "$HOST" -U postgres -c "CREATE ROLE tupaia_read WITH LOGIN ENCRYPTED PASSWORD 'tupaia_read';"

# Install mvrefresh
cd /home/data-api-scripts/pg-mv-fast-refresh
DB_MV_HOME=/home/data-api-scripts/pg-mv-fast-refresh
DB_URL=$HOST ./runCreateFastRefreshModule.sh

cd /home/data-api-scripts
PGPASSWORD=$DB_PG_PASSWORD
psql -h "$HOST" --set=db_user="$DB_USER" --set=mv_user="$DB_MV_USER" -d $DB_NAME -U $DB_PG_USER -f ./grantMvRefreshPermissions.sql

psql -h "$HOST" -U $DB_PG_USER -c "alter role mvrefresh with superuser;"
psql -h "$HOST" -U $DB_PG_USER -c "alter role mvrefresh with login;"

psql -h "$HOST" -U $DB_PG_USER -c "alter role tupaia with superuser;"
psql -h "$HOST" -U $DB_PG_USER -c "alter role tupaia_read with superuser;"

