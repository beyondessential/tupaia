#!/bin/bash

echo "Restoring E2E data from S3"

echo "Pulling dumps from S3"
aws s3 cp s3://tupaia/dumps/e2e/dumps.tgz .

echo "Decompressing dumps"
tar xf dumps.tgz

echo "Disabling notification triggers"
psql -U tupaia tupaia -c "ALTER TABLE survey_response DISABLE TRIGGER survey_response_trigger;"
psql -U tupaia tupaia -c "ALTER TABLE answer DISABLE TRIGGER answer_trigger;"

echo "Clearing survey response and answer tables"
psql -U tupaia tupaia -c "TRUNCATE TABLE survey_response CASCADE;"

echo "Restoring survey responses"
psql -U tupaia tupaia -c "\copy survey_response from 'dumps/.csv' delimiter ',' csv header"

echo "Restoring answers"
psql -U tupaia tupaia -c "\copy answer from 'dumps/.csv' delimiter ',' csv header"

echo "Re-enabling notification triggers"
psql -U tupaia tupaia -c "ALTER TABLE survey_response DISABLE TRIGGER survey_response_trigger;"
psql -U tupaia tupaia -c "ALTER TABLE answer DISABLE TRIGGER answer_trigger;"

echo "Cleaning up"
rm -rf dumps*

echo "Finished restoring E2E data"
