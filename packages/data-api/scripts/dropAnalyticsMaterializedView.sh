#!/bin/bash -e

DIR=$(pwd "$0")
source $DIR/../../scripts/bash/mergeCurrentEnvWithEnvFile.sh 

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

cd scripts
export PGPASSWORD=$DB_PASSWORD
psql -p $DB_PORT -h $DB_URL -d $DB_NAME -U $DB_USER -tc "SELECT drop_analytics_table();"
psql -p $DB_PORT -h $DB_URL -d $DB_NAME -U $DB_USER -tc "SELECT drop_analytics_log_tables();"
