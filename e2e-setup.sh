#!/bin/bash
#set -e # exit if any line fails

# Add SSH key
mkdir -p /root/.ssh
echo "${PRIVATE_SSH_KEY}" |  tr -d '"' | sed 's/\\n/\n/g' > /root/.ssh/id_rsa_tupaia.pem
chmod 600 /root/.ssh/id_rsa_tupaia.pem

set -x # echo all commands (after private key so it is not exposed) TODO

# Fetch db dump
if [ -f db/dump.sql ]; then
    # Shortcut if db/ is mounted
    echo "dump.sql exists, skipping fetch"
   # mv db/dump.sql ./
else
    sh ./scripts/bash/dumpDb.sh /root/.ssh/id_rsa_tupaia.pem
fi

# Roles
psql -h e2e-db-reference -U postgres -c "CREATE ROLE tupaia WITH LOGIN ENCRYPTED PASSWORD 'tupaia';"
psql -h e2e-db-current -U postgres   -c "CREATE ROLE tupaia WITH LOGIN ENCRYPTED PASSWORD 'tupaia';"

psql -h e2e-db-reference -U postgres -c "CREATE ROLE tupaia_read WITH LOGIN ENCRYPTED PASSWORD 'tupaia_read';"
psql -h e2e-db-current -U postgres   -c "CREATE ROLE tupaia_read WITH LOGIN ENCRYPTED PASSWORD 'tupaia_read';"

# Install mvrefresh
cd /home/data-api-scripts/pg-mv-fast-refresh
export DB_MV_HOME=/home/data-api-scripts/pg-mv-fast-refresh
DB_URL=e2e-db-reference ./runCreateFastRefreshModule.sh
DB_URL=e2e-db-current ./runCreateFastRefreshModule.sh

cd /home/data-api-scripts
export PGPASSWORD=$DB_PG_PASSWORD
psql -h e2e-db-reference --set=db_user="$DB_USER" --set=mv_user="$DB_MV_USER" -d $DB_NAME -U $DB_PG_USER -f ./grantMvRefreshPermissions.sql
psql -h e2e-db-current --set=db_user="$DB_USER" --set=mv_user="$DB_MV_USER" -d $DB_NAME -U $DB_PG_USER -f ./grantMvRefreshPermissions.sql

# Run both imports at the same time
sh /home/parallel_commands.sh "psql -h e2e-db-reference -U postgres -f dump.sql" \
    "psql -h e2e-db-current -U postgres -f dump.sql"