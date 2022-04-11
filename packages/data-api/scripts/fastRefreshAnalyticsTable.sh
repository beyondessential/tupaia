#!/bin/bash -e
echo "Fast refreshing analytics table"

DIR=$(pwd "$0")
source $DIR/../../scripts/bash/mergeCurrentEnvWithEnvFile.sh 

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

cd scripts
export PGPASSWORD=$DB_PASSWORD
psql -p $DB_PORT -h $DB_URL -d $DB_NAME -U $DB_USER -tc "SELECT mv\$refreshMaterializedView('analytics', 'public', true);"
