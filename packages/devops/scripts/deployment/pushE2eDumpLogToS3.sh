#!/bin/bash

# Run directly from a nightly cron job, so needs full setup of path etc.

# Set PATH to include depencencies
export PATH=/home/ubuntu/.local/bin:/home/ubuntu/.yarn/bin:/home/ubuntu/.config/yarn/global/node_modules/.bin:/home/ubuntu/.nvm/versions/node/v12.18.3/bin:/usr/local/bin:$PATH

DIR=$(dirname "$0")
export STAGE=$(${DIR}/../utility/getEC2TagValue.sh Stage)
INSTANCE_NAME=$(${DIR}/../utility/getEC2TagValue.sh Name)

if [[ $1 == "--force" ]]; then
    force=true
fi

local_log="/home/ubuntu/logs/dump_e2e_data.log"
s3_folder_uri="s3://tupaia/dumps/e2e"

if [[ "$STAGE" == "e2e" || $force == true ]]; then
    s3_log=$(sed -En "s|.*$s3_folder_uri/(.*).tgz|\1.log|p" $local_log)
    aws s3 cp "$local_log" "$s3_folder_uri/$s3_log"
fi

echo "Removing $local_log"
rm "$local_log"
