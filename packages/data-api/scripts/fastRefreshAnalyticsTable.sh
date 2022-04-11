#!/bin/bash -e
echo "Fast refreshing analytics table"

# Use whatever existing .env vars have been specified
curenv=$(declare -p -x)
test -f .env && source .env
eval "$curenv"

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

cd scripts
export PGPASSWORD=$DB_PASSWORD
psql -p $DB_PORT -h $DB_URL -d $DB_NAME -U $DB_USER -tc "SELECT mv\$refreshMaterializedView('analytics', 'public', true);"
