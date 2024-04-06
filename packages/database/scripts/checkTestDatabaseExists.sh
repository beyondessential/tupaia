#!/usr/bin/env bash
set -e

DIR=$(pwd "$0")
. "$DIR/../../scripts/bash/ansiControlSequences.sh"
. "$DIR/../../scripts/bash/mergeEnvForDB.sh"

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

if [ "$(PGPASSWORD=$DB_PG_PASSWORD psql -p $DB_PORT -X -A -h $DB_URL -U $DB_PG_USER -t -c "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" )" = '1' ]; then
    exit 0
fi

echo -e "${RED}Error: $DB_NAME database does not exist!${RESET}"
echo    'To create it, make sure you have the environment variables from Bitwarden and run:'
echo
echo -e "  ${BOLD}yarn workspace @tupaia/database setup-test-database${RESET}"
echo
echo -e "If you’re missing environment variables, see ${MAGENTA}https://beyond-essential.slab.com/posts/tupaia-monorepo-setup-v5egpdpq#hvfnz-set-environment-variables${RESET}."

exit 1
