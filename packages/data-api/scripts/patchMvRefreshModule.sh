#!/bin/bash

DIR=$(pwd "$0")
source "$DIR/../../scripts/bash/mergeEnvForDB.sh" 

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

# Checks db-migrate's patch tracking table for a row matching each patch file, so we can skip
# the (slow) ts-node startup of the patch runner when there is nothing to apply. Applied patches
# are recorded with names like '1_0_0/20211207200858-AddRenameMaterializedViewLog'. If the check
# can't be sure (e.g. the table doesn't exist yet), we fall through to running the patch runner.
all_patches_applied() {
    : "${DB_PORT:=5432}"
    export PGPASSWORD=$DB_MV_PASSWORD

    local patch_file patch_name applied
    for patch_file in ./scripts/patches/"$VERSION"/*.js; do
        patch_name="$VERSION/$(basename "$patch_file" .js)"
        applied=$(psql -p $DB_PORT -X -A -h $DB_URL -d $DB_NAME -U $DB_MV_USER -t -c \
            "SELECT 1 FROM \"$DB_MV_USER\".patches WHERE name = '$patch_name' LIMIT 1" 2>/dev/null) || return 1
        [[ $applied == 1 ]] || return 1
    done
    return 0
}

if [[ ! -d "./scripts/patches/$VERSION" && ! "$COMMAND" == "create" ]]; then
    echo "No patches exist for version: $VERSION, skipping"
elif [[ "$COMMAND" == "up" ]] && all_patches_applied; then
    echo "All patches for version $VERSION already applied, skipping"
else
    ts-node ./scripts/patchMvRefresh.ts $COMMAND:$VERSION $PATCH_NAME --migrations-dir "./scripts/patches"  --table "patches" -v --config-file "../../babel.config.json"
fi
