#!/bin/bash
source .env
cd scripts
export PGPASSWORD=$DB_PASSWORD
psql -h $DB_URL -d $DB_NAME -U $DB_USER -f dropAnalyticsMaterializedView.sql
