#!/usr/bin/env bash

read -p "Enter migration name: " MIGRATION_NAME
read -p "Enter the scope of this migration ('schema' or 'data'): " MIGRATION_SCOPE

babel-node ./src/migrate.js create ${MIGRATION_NAME}-modifies-${MIGRATION_SCOPE} --migrations-dir ./src/migrations -v --config-file "../../babel.config.json"