#!/bin/bash -ex

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ROOT_DIR="$SCRIPT_DIR/../../../../"
source "$ROOT_DIR/scripts/bash/mergeEnvForDB.sh" 

# Set default port in case it wasn't in .env
: "${DB_PORT:=5432}"

sudo -u postgres psql -p $DB_PORT -c "ALTER USER $DB_PG_USER WITH PASSWORD '$DB_PG_PASSWORD';"
PGPASSWORD=$DB_PG_PASSWORD psql -h $DB_URL -p $DB_PORT -U $DB_PG_USER -c "CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASSWORD';"
PGPASSWORD=$DB_PG_PASSWORD psql -h $DB_URL -p $DB_PORT -U $DB_PG_USER -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

cd $ROOT_DIR

# Initialise NVM (which sets the path for access to npm, yarn etc. as well)
. $HOME/.nvm/nvm.sh

echo "Installing mvrefresh"
DB_NAME=$DB_NAME yarn workspace @tupaia/data-api install-mv-refresh