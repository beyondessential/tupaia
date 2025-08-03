#!/bin/bash

read -p "Enter migration name: " MIGRATION_NAME
read -p "Enter the scope of this migration ('schema' or 'data'): " MIGRATION_SCOPE

babel-node ./src/server/migrate.js create ${MIGRATION_NAME}-modifies-${MIGRATION_SCOPE} --migrations-dir ./src/core/migrations -v --config-file "../../babel.config.json"
