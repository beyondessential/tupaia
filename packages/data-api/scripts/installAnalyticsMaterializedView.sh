#!/bin/bash
source ../.env
echo $DB_URL
export PGPASSWORD=$DB_PG_PASSWORD
psql --set=db_user="$DB_USER" -h $DB_URL -d $DB_NAME -U $DB_PG_USER -f grantMvRefreshPermissions.sql
export PGPASSWORD=$DB_PASSWORD
psql -h $DB_URL -d $DB_NAME -U $DB_USER -f createAnalyticsMaterializedView.sql
