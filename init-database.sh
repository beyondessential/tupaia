#!/bin/bash
set -x

# now that meditrak-server is up and listening for changes, we can run any migrations
# if run earlier when meditrak-server isn't listening, changes will be missed from the
# sync queues
echo "Migrating the database"
echo "TODO"
#yarn migrate
# FIXME: uncomment

# After running migrations it's good to ensure that the analytics table is fully built
#yarn download-parameter-store-env-vars --package-name data-api --environment $ENVIRONMENT
#echo "Building analytics table"
#yarn workspace @tupaia/data-api install-mv-refresh
#yarn workspace @tupaia/data-api build-analytics-table

echo "Migrations run"