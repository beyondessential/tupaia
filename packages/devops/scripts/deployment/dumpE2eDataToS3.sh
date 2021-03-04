#!/bin/bash

# Set PATH to include depencencies
export PATH=/home/ubuntu/.local/bin:/home/ubuntu/.yarn/bin:/home/ubuntu/.config/yarn/global/node_modules/.bin:/home/ubuntu/.nvm/versions/node/v12.18.3/bin:/usr/local/bin:$PATH

DIR=$(dirname "$0")
export STAGE=$(${DIR}/../utility/getEC2TagValue.sh Stage)

# Set the branch based on STAGE
if [[ "$STAGE" == "e2e" ]]; then
  echo "Dumping E2E data from E2E baseline instance to S3"
  mkdir -p dumps

  echo "Dumping survey_response"
  pg_dump -U tupaia --column-inserts --data-only --table=survey_response tupaia > dumps/survey_response.sql

  echo "Dumping answer"
  pg_dump -U tupaia --column-inserts --data-only --table=answer tupaia > dumps/answer.sql

  echo "Compressing dumps"
  tar cfz dumps.tgz dumps/*

  echo "Pushing dumps to S3"
  aws s3 cp dumps.tgz s3://tupaia/dumps/e2e/dumps.tgz

  echo "Cleaning up"
  rm -rf dumps*

  echo "Finished dumping E2E data"
fi



