#!/bin/bash -ex

DB_DUMP=$1

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source "$SCRIPT_DIR/../../../../scripts/bash/mergeEnvForDB.sh" 

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

export PGPASSWORD=$DB_PG_PASSWORD
psql -p $DB_PORT -h $DB_URL -U $DB_PG_USER -f $DB_DUMP