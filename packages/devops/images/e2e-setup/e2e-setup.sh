#!/bin/bash
#set -e # exit if any line fails

# Add SSH key
mkdir -p /root/.ssh
echo "${PRIVATE_SSH_KEY}" |  tr -d '"' | sed 's/\\n/\n/g' > /root/.ssh/id_rsa_tupaia.pem
chmod 600 /root/.ssh/id_rsa_tupaia.pem

set -x # echo all commands (after private key so it is not exposed) TODO

# Init db
sh /home/parallel_commands.sh "./initdb.sh e2e-db-reference" \
    "./initdb.sh e2e-db-current"

# Fetch db dump
if [ -f db/dump.sql ]; then
    # Shortcut if db/ is mounted
    echo "dump.sql exists, skipping fetch"
   # mv db/dump.sql ./
else
    sh ./scripts/bash/dumpDb.sh /root/.ssh/id_rsa_tupaia.pem
fi

# Run both imports at the same time
sh /home/parallel_commands.sh "psql -h e2e-db-reference -U postgres -f dump.sql" \
    "psql -h e2e-db-current -U postgres -f dump.sql"

# Post db dump restore
sh /home/parallel_commands.sh "./postrestore.sh e2e-db-reference" \
    "./postrestore.sh e2e-db-current"