#!/bin/bash
DIR=`dirname "$0"`
${DIR}/waitForPostgres.sh
psql -h $DB_URL -p 5432 -U postgres -d postgres "CREATE USER $DB_USER WITH PASSWORD $DB_PASSWORD"
psql -h $DB_URL -p 5432 -U postgres -d postgres "CREATE DATABASE $DB_NAME WITH OWNER $DB_USER"
PGPASSWORD=$DB_PASSWORD psql -h $DB_URL -p 5432 -U $DB_USER -d $DB_NAME -f src/tests/testData/testDataDump.sql
