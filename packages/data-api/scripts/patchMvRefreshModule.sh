#!/usr/bin/env bash

DIR=$(pwd "$0")
. "$DIR/../../scripts/bash/mergeEnvForDB.sh"
. "$DIR/../../scripts/bash/ansiControlSequences.sh"

COMMAND=$1

if [[ $COMMAND = '' ]]; then
    echo "${RED}Error: missing patch command! Must be one of: up, down, create${RESET}"
    exit 1
fi

if [[ $COMMAND = create ]]; then
    echo 'Enter patch name: '
    read PATCH_NAME
fi

VERSION=$2

if [[ $VERSION = '' ]]; then
    echo 'Version unspecified, defaulting to database mvrefresh version'

    # Set default port in case it wasn't in .env
    : "${DB_PORT:=5432}"

    export PGPASSWORD=$DB_PASSWORD
    VERSION_SQL_FUNC="SELECT mv\$version()"
    VERSION=$(psql -p "$DB_PORT" -X -A -h "$DB_URL" -d "$DB_NAME" -U "$DB_USER" -t -c "$VERSION_SQL_FUNC")

    if [[ $VERSION = '' ]]; then
        echo "${RED}Error: failed to detect mvrefresh version from database${RESET}"
        exit 1
    fi

    echo "Using version: ${BOLD}${GREEN}$VERSION${RESET}"
fi

if [[ ! -d ./scripts/patches/$VERSION && $COMMAND != create ]]; then
    echo "No patches exist for version: $VERSION, skipping"
else
    ts-node ./scripts/patchMvRefresh.ts $COMMAND:$VERSION $PATCH_NAME --migrations-dir './scripts/patches'  --table 'patches' -v --config-file '../../babel.config.json'
fi
