#!/bin/bash -e

# Use whatever existing .env vars have been specified
curenv=$(declare -p -x)
test -f .env && source .env
eval "$curenv"

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

if [ "$(PGPASSWORD=$DB_PG_PASSWORD psql -p $DB_PORT -X -A -h $DB_URL -U $DB_PG_USER -t -c "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" )" = '1' ]
then
    exit 0
fi

echo -e "Error: $DB_NAME database does not exist!\n\nTo create it, please run:\nyarn workspace @tupaia/database setup-test-database\n"
exit 1