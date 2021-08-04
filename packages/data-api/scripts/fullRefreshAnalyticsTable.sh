#!/bin/bash
echo "Fully refreshing analytics table"

source .env

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

cd scripts
export PGPASSWORD=$DB_PASSWORD
psql -p $DB_PORT -h $DB_URL -d $ $DB_USER -f dropAnalyticsTableIndexes.sql
psql -p $DB_PORT -h $DB_URL -d $ $DB_USER -c "SELECT mv\$refreshMaterializedView('analytics', 'public');"
psql -p $DB_PORT -h $DB_URL -d $ $DB_USER -f createAnalyticsTableIndexes.sql
