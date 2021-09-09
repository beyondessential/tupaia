#!/bin/bash

# Exit when any command fails
set -e

function print_help() {
    cat <<EOF
dumpDatabase.sh <identity_file>

Options:
  -h, --help     Show help                                                       [boolean]
  -s, --server   Stage name of the EC2 instance that will be used (default: dev) [string]
  -t, --target   Directory to store the dump under                               [string]
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

domain=$server-ssh.tupaia.org
host="ubuntu@$domain"
dump_file_path="/var/lib/postgresql/$DUMP_FILE_NAME"

echo "Creating dump file in $domain..."
ssh -o StrictHostKeyChecking=no -i $identity_file $host \
    "sudo -u postgres bash -c \"pg_dump tupaia > $dump_file_path\""

echo "Compressing dump file"
ssh -o StrictHostKeyChecking=no -i $identity_file $host \
    "sudo gzip -f $dump_file_path"

target_path="$(
    cd "$target_dir"
    pwd
)/$DUMP_FILE_NAME.gz"
echo "Downloading dump file into '$target_path'..."
scp -i $identity_file "$host:$dump_file_path.gz" $target_dir

echo "Deleting temporary dump file in the server..."
ssh -i $identity_file $host "sudo rm $dump_file_path.gz"

echo "Unzipping local copy"
gzip -d -f $target_path

echo "Done!"
