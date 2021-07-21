#!/bin/bash

# Exit when any command fails
set -e

USAGE="Usage: dumpDb identity_file [-s --server =dev] [-t --target =.]"
DUMP_FILE_NAME="dump.sql"

server="dev"
target_dir="."
identity_file="$1"

if [ "$identity_file" == "" ]; then
    echo "No identity file provided"
    echo $USAGE
    exit 1
fi

while [ "$2" != "" ]; do
    case $2 in
    -s | --server)
        shift
        server=$2
        shift
        ;;
    -t | --target)
        shift
        target_dir=$2
        shift
        ;;
    -h | --help)
        echo "Will download a dump of the latest Tupaia database into the specified target path"
        echo $USAGE
        exit
        ;;
    *)
        echo $USAGE
        exit 1
        ;;
    esac
done

domain=$server.tupaia.org
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
