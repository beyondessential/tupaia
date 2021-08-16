#!/bin/bash
source .env

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

cd scripts
export PGPASSWORD=$DB_PASSWORD
psql -p $DB_PORT -h $DB_URL -d $DB_NAME -U $DB_USER -f createAnalyticsMaterializedView.sql
psql -p $DB_PORT -h $DB_URL -d $DB_NAME -U $DB_USER -f createAnalyticsTableIndexes.sql
