#!/bin/bash

if [[ $CI_BRANCH == "master" ]]; then
    DEPLOYMENT_URL="tupaia.org"
else
    DEPLOYMENT_URL="${CI_BRANCH}.tupaia.org"
fi
EXISTING_INSTANCES=$(aws ec2 describe-instances \
      --filters Name=tag:Branch,Values=${CI_BRANCH} Name=tag-key,Values=SubdomainsViaGateway Name=instance-state-name,Values=running,stopped \
      --no-cli-pager)

if [[ $EXISTING_INSTANCES == *"Instances"* ]]; then
  echo "Existing deployment, triggering redeploy"
  RESPONSE_FILE=lambda_redeploy_response.json
  aws lambda invoke \
    --function-name deployment \
    --payload "{\"Action\": \"redeploy_tupaia_server\", \"Branch\": \"$CI_BRANCH\" }" \
    --cli-binary-format raw-in-base64-out $RESPONSE_FILE \
    --no-cli-pager

  if grep -q errorMessage "$RESPONSE_FILE"; then
    echo "Error while trying to redeploy"
    cat $RESPONSE_FILE
    exit 1
  fi

  NEW_INSTANCE_ID=$(cat $RESPONSE_FILE | cut -d "\"" -f 2)

  echo "Waiting for instance to run its startup build script. To watch detailed progress, connect to instance ${NEW_INSTANCE_ID} and run tail -f logs/deployment_log.txt"
  WAIT_ATTEMPTS=0
  while true; do
    aws ec2 wait instance-exists \
      --instance-ids ${NEW_INSTANCE_ID} \
      --filters Name=tag-key,Values=SubdomainsViaGateway Name=tag:StartupBuildProgress,Values=complete \
      --no-cli-pager
    if [ $? -eq 0 ]; then
      echo "New instance is ready, swapping over ELB"
      aws lambda invoke \
        --function-name deployment \
        --payload "{\"Action\": \"swap_out_tupaia_server\", \"DeploymentName\": \"$DEPLOYMENT_NAME\", \"NewInstanceId\": \"$INSTANCE_ID\" }" \
        --cli-binary-format raw-in-base64-out $RESPONSE_FILE \
        --no-cli-pager
      echo "Redeploy complete"
      break
    else
      if [ "$WAIT_ATTEMPTS" -ge 10 ]; then
        echo "Build failed! Waited 10 times, but new instance is still not reachable"
        exit 1
      else
        echo "Still waiting for instance startup build to complete. To watch detailed progress, connect to instance ${NEW_INSTANCE_ID} and run tail -f logs/deployment_log.txt"
        WAIT_ATTEMPTS=$((WAIT_ATTEMPTS+1))
      fi
    fi
  done

else
  echo "No deployment running, skipping redeploy"
fi
