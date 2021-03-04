#!/bin/bash

# Set PATH to include depencencies
export PATH=/home/ubuntu/.local/bin:/home/ubuntu/.yarn/bin:/home/ubuntu/.config/yarn/global/node_modules/.bin:/home/ubuntu/.nvm/versions/node/v12.18.3/bin:/usr/local/bin:$PATH

DIR=$(dirname "$0")
export STAGE=$(${DIR}/../utility/getEC2TagValue.sh Stage)

# Set the branch based on STAGE
if [[ "$STAGE" == *e2e ]]; then
  echo "Restoring E2E data from S3"

  echo "Pulling dumps from S3"
  aws s3 cp s3://tupaia/dumps/e2e/dumps.tgz .

  echo "Decompressing dumps"
  tar xf dumps.tgz

  echo "Restoring survey responses"
  psql -U tupaia tupaia -c "ALTER TABLE survey_response DISABLE TRIGGER ALL;"
  psql -U tupaia tupaia -c "TRUNCATE TABLE survey_response;"
  psql -U tupaia tupaia < ./dumps/survey_response.sql
  psql -U tupaia tupaia -c "ALTER TABLE survey_response ENABLE TRIGGER ALL;"

  echo "Restoring answers"
  psql -U tupaia tupaia -c "ALTER TABLE answer DISABLE TRIGGER ALL;"
  psql -U tupaia tupaia -c "TRUNCATE TABLE answer;"
  psql -U tupaia tupaia < ./dumps/answer.sql
  psql -U tupaia tupaia -c "ALTER TABLE answer ENABLE TRIGGER ALL;"

  echo "Cleaning up"
  rm -rf dumps*

  echo "Finished restoring E2E data"
fi



