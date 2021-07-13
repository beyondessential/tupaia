#!/bin/bash
echo "Fully refreshing analytics table"

source .env
cd scripts
export PGPASSWORD=$DB_PASSWORD
psql -p $DB_PORT -h $DB_URL -d $ $DB_USER -f dropAnalyticsTableIndexes.sql
psql -p $DB_PORT -h $DB_URL -d $ $DB_USER -c "SELECT mv\$refreshMaterializedView('analytics', 'public');"
psql -p $DB_PORT -h $DB_URL -d $ $DB_USER -f createAnalyticsTableIndexes.sql
