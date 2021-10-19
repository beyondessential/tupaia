#!/bin/bash

COMMAND=$1

if [[ "$COMMAND" == "" ]]; then
    echo "Error: missing patch command! Must be one of: up, down, create"
    exit 1
fi

if [[ "$COMMAND" == "create" ]]; then
    echo "Enter patch name: "
    read PATCH_NAME
fi

VERSION=$2

if [[ "$VERSION" == "" ]]; then
    # if env vars are not already defined (e.g. by script caller during CI/CD), pull them in from .env
    if [ "$DB_URL" == "" ]; then
        source .env
    fi

    # Set default port in case it wasn't in .env
    : "${DB_PORT:=5432}"

    export PGPASSWORD=$DB_PASSWORD
    VERSION_SQL_FUNC="SELECT mv\$version()"
    DB_MV_VERSION=`psql -p $DB_PORT -X -A -h $DB_URL -d $DB_NAME -U $DB_USER -t -c "$VERSION_SQL_FUNC"`
    echo "Version unspecified, defaulting to database mvrefresh version: $DB_MV_VERSION"
    babel-node ./scripts/patchMvRefresh.js $COMMAND:$DB_MV_VERSION $PATCH_NAME -v --config-file "../../babel.config.json"
else
    babel-node ./scripts/patchMvRefresh.js $COMMAND:$VERSION $PATCH_NAME -v --config-file "../../babel.config.json"
fi

