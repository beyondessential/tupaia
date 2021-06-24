#!/bin/bash
set -x
set -e # exit if any line fails

HOST=$1

if [ -z "$HOST" ]
then
      echo "Must pass DB_URL"
      exit 1;
fi

cd /home/data-api/scripts

# yarn workspace @tupaia/data-api build-analytics-table
psql -h $HOST -d $DB_NAME -U $DB_USER -f createAnalyticsMaterializedView.sql

PGPASSWORD=$DB_MV_PASSWORD
psql -h $HOST -d $DB_NAME -U $DB_MV_USER -f createAnalyticsTableIndexes.sql