#!/bin/bash
source .env
cd scripts
export PGPASSWORD=$DB_PASSWORD
psql -h $DB_URL -d $DB_NAME -U $DB_USER -f createAnalyticsMaterializedView.sql
psql -h $DB_URL -d $DB_NAME -U $DB_USER -f createAnalyticsTableIndexes.sql
