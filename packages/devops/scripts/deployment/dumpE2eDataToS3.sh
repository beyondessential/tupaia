#!/bin/bash

# Run directly from a nightly cron job, so needs full setup of path etc.

# Set PATH to include depencencies
export PATH=/home/ubuntu/.local/bin:/home/ubuntu/.yarn/bin:/home/ubuntu/.config/yarn/global/node_modules/.bin:/home/ubuntu/.nvm/versions/node/v12.18.3/bin:/usr/local/bin:$PATH

DIR=$(dirname "$0")
export STAGE=$(${DIR}/../utility/getEC2TagValue.sh Stage)

# Set the branch based on STAGE
if [[ "$STAGE" == "e2e" ]]; then
  echo "Dumping E2E data from E2E baseline instance to S3"
  mkdir -p dumps

  echo "Dumping survey_response"
  psql -U tupaia tupaia -c "\copy survey_response to 'dumps/survey_response.csv' csv header"

  echo "Dumping answer"
  psql -U tupaia tupaia -c "\copy answer to 'dumps/answer.csv' csv header"

  echo "Compressing dumps"
  tar cfz dumps.tgz dumps/*

  echo "Pushing dumps to S3"
  aws s3 cp dumps.tgz s3://tupaia/dumps/e2e/dumps.tgz

  echo "Cleaning up"
  rm -rf dumps*

  echo "Finished dumping E2E data"
fi



