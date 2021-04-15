#!/bin/bash

# Run directly from a nightly cron job, so needs full setup of path etc.

# Set PATH to include depencencies
export PATH=/home/ubuntu/.local/bin:/home/ubuntu/.yarn/bin:/home/ubuntu/.config/yarn/global/node_modules/.bin:/home/ubuntu/.nvm/versions/node/v12.18.3/bin:/usr/local/bin:$PATH

DIR=$(dirname "$0")
export STAGE=$(${DIR}/../utility/getEC2TagValue.sh Stage)
INSTANCE_NAME=$(${DIR}/../utility/getEC2TagValue.sh Name)

function dump_table() {
  local table="$1"

  echo "Dumping $table"
  psql -U tupaia tupaia -c "\copy $table to 'dumps/$table.csv' delimiter ',' csv header"
}

if [[ $1 == "--force" ]]; then
  force=true
fi

if [[ "$STAGE" == "e2e" || $force == true ]]; then
  echo "Dumping E2E data from '$INSTANCE_NAME' to S3"
  mkdir -p dumps

  dump_table survey_response
  dump_table answer
  dump_table analytics

  dump_file="${STAGE}_$(date '+%s')_dumps.tgz"

  echo "Compressing dumps"
  tar cfz $dump_file dumps/*

  echo "Pushing dumps to S3"
  aws s3 cp $dump_file "s3://tupaia/dumps/e2e/$dump_file"

  echo "Cleaning up"
  rm -rf dumps
  rm -rf "$dump_file"

  echo "Finished dumping E2E data"
else
  echo "Stage of current instance is not 'e2e', skipping E2E data dump"
fi
