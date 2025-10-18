#!/usr/bin/env bash
set -e

function print_help() {
    cat <<EOF
dumpDatabase.sh <identity_file>

Options:
  -h, --help     Show help                                                              [boolean]
  -s, --server   Deployment name of the DB instance that will be used (default: dev)    [string]
  -t, --target   Directory to store the dump under                                      [string]
EOF
}

# https://stackoverflow.com/questions/12498304/using-bash-to-display-a-progress-indicator
function show_loading_spinner() {
    eval "$2" &
    pid=$! # Process Id of the previous running command

    spin='-\|/'

    i=0
    while kill -0 "$pid" 2>/dev/null
    do
    i=$(( (i+1) %4 ))
    printf "\r$1 ${spin:$i:1}"
    sleep .5
    done
    printf "\r$1  "
    echo # reset prompt
}

DIR=$(pwd "$0")
. "$DIR/../../scripts/bash/mergeEnvForDB.sh"
. "$DIR/../../scripts/bash/ansiControlSequences.sh"

DUMP_FILE_NAME='dump.sql'

identity_file=''
server='dev'
target_dir='.'

while [[ $1 != '' ]]; do
    case $1 in
    -s | --server)
        shift
        server=$1
        shift
        ;;
    -t | --target)
        shift
        target_dir=$1
        shift
        ;;
    -h | --help)
        print_help
        exit
        ;;
    *)
        if [[ $identity_file = '' ]]; then
            identity_file=$1
            shift
        else
            print_help
            exit 1
        fi
        ;;
    esac
done

if [[ $identity_file = '' ]]; then
    print_help
    exit 1
fi

if [[ $DB_PG_USER = '' || $DB_PG_PASSWORD = '' ]]; then
    echo -e "${RED}Missing Postgres user credential env vars in @tupaia/database .env file.${RESET} Check Bitwarden for variables and add them to the .env file"
    exit 1
fi

host=$server-db.tupaia.org
target_path="$(
    cd "$target_dir"
    pwd
)/$DUMP_FILE_NAME"
target_zip_path="$target_path.gz"

show_loading_spinner "Dumping database to $target_zip_path" "PGPASSWORD=$DB_PG_PASSWORD pg_dump \"host=$host user=$DB_PG_USER dbname=tupaia sslmode=require sslkey=$identity_file\" -Z1 -f $target_zip_path"
show_loading_spinner "Unzipping $target_zip_path" "gunzip -f $target_zip_path"

echo    "Dump file available at $target_path"
echo -e "${GREEN}Done!${RESET}"
