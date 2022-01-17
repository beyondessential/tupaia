#!/bin/bash -le

INSTANCE_IDENTIFIER=$1

echo "Performing reclone for ${INSTANCE_IDENTIFIER}"
AWS_MAX_ATTEMPTS=1 aws lambda invoke \
  --function-name testRDS \
  --payload "{\"Action\": \"redeploy_tupaia_database\", \"DeploymentName\": \"${INSTANCE_IDENTIFIER}\" }" \
  --no-cli-pager \
  --cli-read-timeout 900

