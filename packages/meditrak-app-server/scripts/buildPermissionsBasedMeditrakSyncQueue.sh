#!/bin/bash -e

DIR=$(pwd "$0")
source $DIR/../../scripts/bash/mergeCurrentEnvWithEnvFile.sh 

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

cd scripts
export PGPASSWORD=$DB_PASSWORD
if [[ "$1" == "--force" || "$1" == "-f" ]]; then
  psql -p $DB_PORT -h $DB_URL -d $DB_NAME -U $DB_USER -tc "SELECT build_permission_based_meditrak_sync_queue(true);"
else
  psql -p $DB_PORT -h $DB_URL -d $DB_NAME -U $DB_USER -tc "SELECT build_permission_based_meditrak_sync_queue();"
fi
