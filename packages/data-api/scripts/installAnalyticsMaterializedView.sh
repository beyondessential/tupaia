#!/bin/bash
source ../.env
export PGPASSWORD=$DB_PG_PASSWORD
psql --set=db_user="$DB_USER" --set=mv_user="$DB_MV_USER" -h $DB_URL -d $DB_NAME -U $DB_PG_USER -f grantMvRefreshPermissions.sql
export PGPASSWORD=$DB_PASSWORD
psql -h $DB_URL -d $DB_NAME -U $DB_USER -f createAnalyticsMaterializedView.sql
export PGPASSWORD=$DB_MV_PASSWORD
psql -h $DB_URL -d $DB_NAME -U $DB_MV_USER -f createAnalyticsTableIndexes.sql
