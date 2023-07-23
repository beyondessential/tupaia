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
    echo "Version unspecified, defaulting to database mvrefresh version"
    
    # Use whatever existing .env vars have been specified
    curenv=$(declare -p -x)
    test -f .env && source .env
    eval "$curenv"

    # Set default port in case it wasn't in .env
    : "${DB_PORT:=5432}"

    export PGPASSWORD=$DB_PASSWORD
    VERSION_SQL_FUNC="SELECT mv\$version()"
    VERSION=`psql -p $DB_PORT -X -A -h $DB_URL -d $DB_NAME -U $DB_USER -t -c "$VERSION_SQL_FUNC"`

    if [[ "$VERSION" == "" ]]; then
        echo "Error: failed to detect mvrefresh version from database"
        exit 1
    fi

    echo "Using version: $VERSION"
fi

if [[ ! -d "./scripts/patches/$VERSION" && ! "$COMMAND" == "create" ]]; then
    echo "No patches exist for version: $VERSION, skipping"
else
    ts-node ./scripts/patchMvRefresh.ts $COMMAND:$VERSION $PATCH_NAME --migrations-dir "./scripts/patches"  --table "patches" -v --config-file "../../babel.config.json"
fi
