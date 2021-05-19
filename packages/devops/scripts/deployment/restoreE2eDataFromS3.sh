#!/bin/bash

function restore_table() {
  local user="$1"
  local table="$2"

  echo "Restoring $table"
  psql -U "$user" tupaia -c "\copy $table from 'dumps/$table.csv' delimiter ',' csv header"
}

s3_folder="dumps/e2e"

echo "Restoring E2E data from S3"

echo "Pulling latest dump from S3"
s3_dump_path=$(
  aws s3api list-objects-v2 \
    --bucket tupaia \
    --prefix $s3_folder/ \
    --query 'reverse(sort_by(Contents[?ends_with(Key, `.tgz`)], &LastModified))[:1].Key' \
    --no-paginate \
    --output=text
)
aws s3 cp "s3://tupaia/$s3_dump_path" .
dump_file=$(echo "$s3_dump_path" | sed "s|$s3_folder/||")

echo "Decompressing dumps"
tar xf "$dump_file"

echo "Disabling notification triggers"
psql -U tupaia tupaia -c "ALTER TABLE survey_response DISABLE TRIGGER survey_response_trigger;"
psql -U tupaia tupaia -c "ALTER TABLE survey_response DISABLE TRIGGER trig\$_survey_response;"
psql -U tupaia tupaia -c "ALTER TABLE answer DISABLE TRIGGER answer_trigger;"
psql -U tupaia tupaia -c "ALTER TABLE answer DISABLE TRIGGER trig\$_answer;"

echo "Clearing tables: survey_response, answer, analytics"
psql -U tupaia tupaia -c "TRUNCATE TABLE survey_response CASCADE;"
psql -U mvrefresh tupaia -c "TRUNCATE TABLE analytics;"

restore_table tupaia survey_response
restore_table tupaia answer
restore_table mvrefresh analytics

echo "Re-enabling notification triggers"
psql -U tupaia tupaia -c "ALTER TABLE survey_response ENABLE TRIGGER survey_response_trigger;"
psql -U tupaia tupaia -c "ALTER TABLE survey_response ENABLE TRIGGER trig\$_survey_response;"
psql -U tupaia tupaia -c "ALTER TABLE answer ENABLE TRIGGER answer_trigger;"
psql -U tupaia tupaia -c "ALTER TABLE answer ENABLE TRIGGER trig\$_answer;"

echo "Cleaning up"
rm -rf dumps
rm -rf "$dump_file"

echo "Finished restoring E2E data"
