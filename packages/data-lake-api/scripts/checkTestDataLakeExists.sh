#!/bin/bash -e

DIR=$(pwd "$0")
source "$DIR/../../scripts/bash/mergeEnvForDB.sh" 

# Set default port in case it wasn't in .env
: "${DATA_LAKE_DB_PORT:=5432}"

if [ "$(PGPASSWORD=$DB_PG_PASSWORD psql -p $DATA_LAKE_DB_PORT -X -A -h $DATA_LAKE_DB_URL -U $DB_PG_USER -t -c "SELECT 1 FROM pg_database WHERE datname='$DATA_LAKE_DB_NAME'" )" = '1' ]
then
    exit 0
fi

echo -e "Error: $DATA_LAKE_DB_NAME database does not exist!\n\nTo create it, please get the .env file from Bitwarden then run:\nyarn workspace @tupaia/data-lake-api setup-test-data-lake\n"
exit 1
