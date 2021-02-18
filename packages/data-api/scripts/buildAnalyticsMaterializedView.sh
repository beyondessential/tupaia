#!/bin/bash
source .env
cd scripts
export PGPASSWORD=$DB_PASSWORD
psql -h $DB_URL -d $DB_NAME -U $DB_USER -f createAnalyticsMaterializedView.sql
export PGPASSWORD=$DB_MV_PASSWORD
psql -h $DB_URL -d $DB_NAME -U $DB_MV_USER -f createAnalyticsTableIndexes.sql
