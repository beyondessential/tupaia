#!/usr/bin/env bash
set -ex
  

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )  

# Load environment variables from .env files
source "$SCRIPT_DIR/../../../../scripts/bash/mergeEnvForDB.sh"

cd "$SCRIPT_DIR"
 

cd ../../../..
echo "Connected to postgres server: $DB_URL, starting to setup database"
yarn workspace @tupaia/database setup-test-database

# Run check
yarn workspace @tupaia/types assert-no-changes
