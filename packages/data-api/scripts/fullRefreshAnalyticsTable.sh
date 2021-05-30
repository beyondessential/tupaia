#!/bin/bash
echo "Fully refreshing analytics table"

source .env
cd scripts
export PGPASSWORD=$DB_MV_PASSWORD
psql -h $DB_URL -d $DB_NAME -U $DB_MV_USER -f dropAnalyticsTableIndexes.sql
export PGPASSWORD=$DB_PASSWORD
psql -h $DB_URL -d $DB_NAME -U $DB_USER -c "SELECT mv\$refreshMaterializedView('analytics', 'public');"
export PGPASSWORD=$DB_MV_PASSWORD
psql -h $DB_URL -d $DB_NAME -U $DB_MV_USER -f createAnalyticsTableIndexes.sql
