#!/usr/bin/env bash
set -e

stopped_instances=$(aws ec2 describe-instances \
  --filters "Name=tag:Branch,Values=${CI_BRANCH}" Name=tag:DeploymentType,Values=tupaia Name=instance-state-name,Values=stopped \
  --no-cli-pager)

if [[ $stopped_instances = *Instances* ]]; then
  echo "::warning::Can’t redeploy while a deployment for $CI_BRANCH is stopped. Try again inside office hours, or start the app server and database then restart the build."
  exit 1
fi

running_instances=$(aws ec2 describe-instances \
  --filters "Name=tag:Branch,Values=${CI_BRANCH}" Name=tag:DeploymentType,Values=tupaia Name=instance-state-name,Values=running \
  --no-cli-pager)

if [[ $running_instances != *Instances* ]]; then
  echo 'Nothing to redeploy'
  exit 0
fi

echo "At least one running deployment, triggering redeploy of any tagged with Branch $CI_BRANCH"
response_file=lambda_redeploy_response.json
redeploy_payload=$(jq -n \
  --arg user "$CI_COMMITTER_NAME via GitHub Actions" \
  --arg branch "$CI_BRANCH" \
  '{Action: "redeploy_tupaia_server", User: $user, Branch: $branch}')
AWS_MAX_ATTEMPTS=1 aws lambda invoke \
  --function-name deployment \
  --payload "$redeploy_payload" \
  --no-cli-pager \
  --cli-binary-format raw-in-base64-out \
  --cli-read-timeout 900 \
  "$response_file"

if grep -q errorMessage "$response_file"; then
  echo '::error::Error while trying to redeploy'
  cat "$response_file"
  exit 1
fi

deployments_base64=$(jq -r '.[] | @base64' "$response_file")
readarray -t deployments < <(printf '%s' "$deployments_base64")
for deployment_base64 in "${deployments[@]}"; do
  deployment=$(echo "$deployment_base64" | base64 --decode)
  deployment_name=$(echo "$deployment" | jq -r '.DeploymentName')
  new_instance_id=$(echo "$deployment" | jq -r '.NewInstanceId')

  declare -i wait_attempts=0
  echo "Waiting for $deployment_name to run its startup build script. To watch detailed progress, connect to instance $new_instance_id and run tail -f ~/logs/deployment.log"
  echo
  echo "  https://ap-southeast-2.console.aws.amazon.com/ec2/home?region=ap-southeast-2#ConnectToInstance:instanceId=$new_instance_id"
  echo
  while true; do
    startup_complete=false
    aws ec2 wait instance-exists \
      --instance-ids "$new_instance_id" \
      --filters Name=tag:StartupBuildProgress,Values=complete,errored \
      --no-cli-pager && startup_complete=true
    if [ "$startup_complete" == true ]; then
      instance_errored_response=$(aws ec2 describe-instances \
        --instance-ids "$new_instance_id" \
        --filters Name=tag:StartupBuildProgress,Values=errored \
        --no-cli-pager)
      if [[ $instance_errored_response = *Instances* ]]; then
        echo "::error::Build failed! Connect to instance $new_instance_id and check the logs at ~/logs/deployment.log and /var/log/cloud-init-output.log"
        exit 1
      fi
      echo "New instance ${new_instance_id} is ready, swapping over ELB"
      swap_out_response_file=lambda_swap_out_response.json
      swap_out_payload=$(jq -n \
        --arg user "${CI_COMMITTER_NAME} via GitHub Actions" \
        --arg deploymentName "$deployment_name" \
        --arg newInstanceId "$new_instance_id" \
        '{Action: "swap_out_tupaia_server", User: $user, DeploymentName: $deploymentName, NewInstanceId: $newInstanceId}')
      AWS_MAX_ATTEMPTS=1 aws lambda invoke \
        --function-name deployment \
        --payload "$swap_out_payload" \
        --no-cli-pager \
        --cli-binary-format raw-in-base64-out \
        --cli-read-timeout 900 \
        "$swap_out_response_file"
      if grep -q errorMessage "$swap_out_response_file"; then
        echo '::error::Error while trying to swap out instances'
        cat "$swap_out_response_file"
        exit 1
      fi
      echo "ELB for $deployment_name now points to $new_instance_id"
      break
    else
      if ((wait_attempts >= 18)); then # 18 × 200 seconds = 1 hour
        echo "::error::Build failed! Waited 18 times, but new instance $new_instance_id is still not reachable"
        exit 1
      else
        echo "Still waiting for $deployment_name startup build to complete. To watch detailed progress, connect to instance $new_instance_id and run tail -f ~/logs/deployment.log"
        wait_attempts=$((wait_attempts + 1))
      fi
    fi
  done
done

echo Redeployed
