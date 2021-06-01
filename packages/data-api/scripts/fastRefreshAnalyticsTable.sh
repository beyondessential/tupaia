#!/bin/bash
echo "Fast refreshing analytics table"

source .env
cd scripts
export PGPASSWORD=$DB_PASSWORD
psql -h $DB_URL -d $DB_NAME -U $DB_USER -c "SELECT mv\$refreshMaterializedView('analytics', 'public', true);"
