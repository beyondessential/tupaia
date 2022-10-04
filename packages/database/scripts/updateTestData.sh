#!/bin/bash -xe

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"

source ../.env

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

# Exclude tables user tupaia doesn't have access to
EXCLUDETABLE=$(PGPASSWORD=$DB_PASSWORD psql -t -h $DB_URL -p $DB_PORT -U $DB_USER -d $DB_NAME -c "select '--exclude-table=' || string_agg(tablename,' --exclude-table=') FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tableowner NOT LIKE '$DB_USER';" )

PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_URL -p $DB_PORT -U $DB_USER -O --schema public $EXCLUDETABLE -s $DB_NAME > "../src/__tests__/testData/testDataDump.sql"
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_URL -p $DB_PORT -U $DB_USER -O --schema public $EXCLUDETABLE -c -t migrations $DB_NAME >> "../src/__tests__/testData/testDataDump.sql"

echo "Done"