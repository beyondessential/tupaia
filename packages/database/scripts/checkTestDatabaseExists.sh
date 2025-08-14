#!/bin/bash -e

DIR=$(pwd "$0")
source "$DIR/../../scripts/bash/mergeEnvForDB.sh" 

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

if [ "$(PGPASSWORD=$DB_PG_PASSWORD psql -p $DB_PORT -X -A -h $DB_URL -U $DB_PG_USER -t -c "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" )" = '1' ]
then
    exit 0
fi

echo -e "\033[31mError: $DB_NAME database does not exist!\033[m"
echo    "To create it, get the .env file from Bitwarden then run:"
echo    ""
echo -e "  \033[1myarn workspace @tupaia/database setup-test-database\033[m"
echo    ""

exit 1
