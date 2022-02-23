#!/bin/bash -e

function print_help() {
    cat <<EOF
dumpDatabase.sh <identity_file>

Options:
  -h, --help     Show help                                                              [boolean]
  -s, --server   Deployment name of the DB instance that will be used (default: dev)    [string]
  -t, --target   Directory to store the dump under                                      [string]
EOF
}

DUMP_FILE_NAME="dump.sql"

identity_file=""
server="dev"
target_dir="."

while [ "$1" != "" ]; do
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
        if [ "$identity_file" == "" ]; then
            identity_file=$1
            shift
        else
            print_help
            exit 1
        fi
        ;;
    esac
done

if [ "$identity_file" == "" ]; then
    print_help
    exit 1
fi

host=$server-db.tupaia.org
target_path="$(
    cd "$target_dir"
    pwd
)/$DUMP_FILE_NAME"

pg_dump "host=$host user=postgres dbname=tupaia sslmode=require sslkey=$identity_file" -f $target_path

echo "Done!"
