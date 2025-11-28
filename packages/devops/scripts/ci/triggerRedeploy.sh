#!/bin/bash -e

STOPPED_INSTANCES=$(aws ec2 describe-instances \
      --filters Name=tag:Branch,Values=${CI_BRANCH} Name=tag:DeploymentType,Values=tupaia Name=instance-state-name,Values=stopped \
      --no-cli-pager)

if [[ $STOPPED_INSTANCES == *"Instances"* ]]; then
  echo "::warning::Can’t redeploy while a deployment for $CI_BRANCH is stopped. Try again inside office hours, or start the app server and database then restart the build."
  exit 1
fi


RUNNING_INSTANCES=$(aws ec2 describe-instances \
      --filters Name=tag:Branch,Values=${CI_BRANCH} Name=tag:DeploymentType,Values=tupaia Name=instance-state-name,Values=running \
      --no-cli-pager)

if [[ $RUNNING_INSTANCES != *"Instances"* ]]; then
  echo "No deployment running, skipping redeploy"
  exit 0
fi

echo "At least one running deployment, triggering redeploy of any tagged with Branch ${CI_BRANCH}"
RESPONSE_FILE=lambda_redeploy_response.json
AWS_MAX_ATTEMPTS=1 aws lambda invoke \
  --function-name deployment \
  --payload "{\"Action\": \"redeploy_tupaia_server\", \"User\": \"${CI_COMMITTER_NAME} via GitHub Actions\", \"Branch\": \"$CI_BRANCH\" }" \
  --no-cli-pager \
  --cli-binary-format raw-in-base64-out \
  --cli-read-timeout 900 \
  $RESPONSE_FILE

if grep -q errorMessage "$RESPONSE_FILE"; then
  echo "::error::Error while trying to redeploy"
  cat $RESPONSE_FILE
  exit 1
fi

DEPLOYMENTS=$(cat $RESPONSE_FILE | jq -r '.[] | @base64')
for DEPLOYMENT_BASE64 in $DEPLOYMENTS; do
  DEPLOYMENT=$(echo $DEPLOYMENT_BASE64 | base64 --decode)
  DEPLOYMENT_NAME=$(echo $DEPLOYMENT | jq -r '.DeploymentName')
  NEW_INSTANCE_ID=$(echo $DEPLOYMENT | jq -r '.NewInstanceId')

  WAIT_ATTEMPTS=0
  echo "Waiting for $DEPLOYMENT_NAME to run its startup build script. To watch detailed progress, connect to instance $NEW_INSTANCE_ID and run tail -f ~/logs/deployment.log"
  echo
  echo "  https://ap-southeast-2.console.aws.amazon.com/ec2/home?region=ap-southeast-2#ConnectToInstance:instanceId=$NEW_INSTANCE_ID"
  echo
  while true; do
    STARTUP_COMPLETE=false
    aws ec2 wait instance-exists \
      --instance-ids ${NEW_INSTANCE_ID} \
      --filters Name=tag:StartupBuildProgress,Values=complete,errored \
      --no-cli-pager && STARTUP_COMPLETE=true
    if [ $STARTUP_COMPLETE == true ]; then
      INSTANCE_ERRORED_RESPONSE=$(aws ec2 describe-instances \
          --instance-ids ${NEW_INSTANCE_ID} \
          --filters Name=tag:StartupBuildProgress,Values=errored \
          --no-cli-pager)
      if [[ $INSTANCE_ERRORED_RESPONSE == *"Instances"* ]]; then
        echo "::error::Build failed! Connect to instance $NEW_INSTANCE_ID and check the logs at ~/logs/deployment.log and /var/log/cloud-init-output.log"
        exit 1
      fi
      echo "New instance ${NEW_INSTANCE_ID} is ready, swapping over ELB"
      SWAP_OUT_RESPONSE_FILE=lambda_swap_out_response.json
      AWS_MAX_ATTEMPTS=1 aws lambda invoke \
        --function-name deployment \
        --payload "{\"Action\": \"swap_out_tupaia_server\", \"User\": \"${CI_COMMITTER_NAME} via GitHub Actions\", \"DeploymentName\": \"$DEPLOYMENT_NAME\", \"NewInstanceId\": \"$NEW_INSTANCE_ID\" }" \
        --no-cli-pager \
        --cli-binary-format raw-in-base64-out \
        --cli-read-timeout 900 \
        $SWAP_OUT_RESPONSE_FILE
      if grep -q errorMessage "$SWAP_OUT_RESPONSE_FILE"; then
        echo "Error while trying to swap out instances"
        cat $SWAP_OUT_RESPONSE_FILE
        exit 1
      fi
      echo "ELB for ${DEPLOYMENT_NAME} now points to ${NEW_INSTANCE_ID}"
      break
    else
      if [ "$WAIT_ATTEMPTS" -ge 75 ]; then # 75 * 200 seconds = 4.16 hours, sitting within codeship's 5 hour timeout
        echo "::error::Build failed! Waited 75 times, but new instance is still not reachable"
        exit 1
      else
        echo "Still waiting for $DEPLOYMENT_NAME startup build to complete. To watch detailed progress, connect to instance $NEW_INSTANCE_ID and run tail -f ~/logs/deployment.log"
        WAIT_ATTEMPTS=$((WAIT_ATTEMPTS + 1))
      fi
    fi
  done
done

echo "Redeploy complete"
