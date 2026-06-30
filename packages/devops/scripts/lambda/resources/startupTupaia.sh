#!/bin/bash -leE
# This script gets loaded as "User Data" against the EC2 instance, and deploys the tagged branch
# the first time the instance starts
#
# REMARK
#   The production version of this script lives in the ‘deployment’ Lambda function; simply merging
#   does not deploy code changes to production. To make changes, see
#   https://beyond-essential.slab.com/posts/making-changes-to-deployment-process-9kjpcjic

set -o pipefail # fail pipe where scripts are e.g. piped out to deployment logs

declare -i start_time="$SECONDS"

home_dir=/home/ubuntu
tupaia_dir=$home_dir/tupaia
logs_dir=$home_dir/logs
devops_dir=$tupaia_dir/packages/devops
deployment_scripts=$devops_dir/scripts/deployment-aws

# Add tag for CI/CD to use as a health check
instance_id=$(ec2metadata --instance-id)
aws ec2 create-tags --resources "$instance_id" --tags Key=StartupBuildProgress,Value=building

# Mark the build progress as errored if anything goes wrong
tag_errored() {
  aws ec2 create-tags --resources "$instance_id" --tags Key=StartupBuildProgress,Value=errored
  service nginx stop # stop nginx as an obvious sign the build has failed

  declare -i duration=$((SECONDS - start_time))
  echo "Startup failed after $((duration / 60)) min $((duration % 60)) s"
}
trap tag_errored ERR

deployment_name=$("$deployment_scripts"/../utility/getEC2TagValue.sh DeploymentName)
branch=$("$deployment_scripts"/../utility/getEC2TagValue.sh Branch)

# Set bash prompt to have deployment name in it
set_prompt() {
  local reset='\e[m'
  local bold_red='\e[1;31m'
  local bold_green='\e[1;32m'
  local bold_blue='\e[1;34m'
  local bold_cyan='\e[1;36m'
  if [[ $deployment_name = production ]]; then
    local username_format=$bold_red
  else
    local username_format=$bold_cyan
  fi

  local prompt='\['                              # begin non-printing chars
  prompt+='\e]0;'                                #   begin window title
  prompt+="\\u@$deployment_name: \\w"            #    e.g. 'username@deployment-name: ~'
  prompt+='\a'                                   #   end window title
  prompt+='\]'                                   # end non-printing chars
  prompt+='${debian_chroot:+($debian_chroot)}'   # debian_chroot, if set (else nothing)
  prompt+=$bold_green\\u$reset                   # username
  prompt+=@                                      # '@'
  prompt+=$username_format$deployment_name$reset # deployment name
  prompt+=:                                      # ':'
  prompt+=$bold_blue\\w$reset                    # working directory
  prompt+='\$ '                                  # '#' if uid is 0, else '$', followed by trailing wordspace

  echo "PS1=${prompt@Q}" >>"$home_dir"/.bashrc
}
set_prompt

# Create a directory for logs to go
mkdir -m 777 -p "$logs_dir"

schedule_preaggregation_job() {
  \. "$home_dir/.nvm/nvm.sh" # Load nvm so node is available on $PATH
  sudo -u ubuntu echo "10 13 * * * PATH=$PATH $home_dir/tupaia/packages/web-config-server/run_preaggregation.sh | while IFS= read -r line; do echo \"\$(date --iso-8601=seconds) │ \$line\"; done > $logs_dir/preaggregation.txt" >tmp.cron
  sudo -u ubuntu crontab -l >>tmp.cron || echo >>tmp.cron
  sudo -u ubuntu crontab tmp.cron
  rm tmp.cron
}

fetch_latest_code() {
  cd "$tupaia_dir"
  if sudo -Hu ubuntu git ls-remote --exit-code --heads origin "$branch" &>/dev/null; then
    echo "Fetching latest code from branch $branch..."
    local branch_to_use=$branch
  else
    echo "Branch $branch doesn’t exist. Fetching latest code from dev..."
    local branch_to_use=dev
  fi
  set -x
  sudo -Hu ubuntu git remote set-branches --add origin "$branch_to_use"
  sudo -Hu ubuntu git fetch --all --prune
  sudo -Hu ubuntu git reset --hard # clear out any manual changes that have been made, which would cause checkout to fail
  sudo -Hu ubuntu git switch "$branch_to_use"
  sudo -Hu ubuntu git reset --hard origin/"$branch_to_use"
  set +x
}

main() {
  echo "Starting up $deployment_name ($branch)"

  # Turn on cloudwatch agent for prod and dev (can be turned on manually if needed on feature instances)
  # TODO currently broken
  # if [[ $deployment_name = production || $deployment_name = dev ]]; then
  #   $deployment_scripts/startCloudwatchAgent.sh
  # fi

  if [[ $deployment_name = production ]]; then
    schedule_preaggregation_job
  fi

  fetch_latest_code

  # central-server and data-table-server need Tailnet access for external database connections
  sudo -Hu ubuntu "$devops_dir"/connectTailscale.sh
  sudo -Hu ubuntu "$devops_dir"/initTailscaleSystemd.sh
  # Build each package, including injecting environment variables from Bitwarden
  sudo -Hu ubuntu "$deployment_scripts"/buildDeployablePackages.sh "$deployment_name"
  # Deploy each package
  sudo -Hu ubuntu "$deployment_scripts"/../deployment-common/startBackEnds.sh
  # Set nginx config and start the service running
  sudo -E DEPLOYMENT_NAME="$deployment_name" "$deployment_scripts"/configureNginx.sh

  # Tag as complete so CI/CD system can use the tag as a health check
  aws ec2 create-tags --resources "$instance_id" --tags Key=StartupBuildProgress,Value=complete

  local -i duration=$((SECONDS - start_time))
  echo "Startup completed in $((duration / 60)) min $((duration % 60)) s"
}

main |&
  while IFS= read -r line; do
    echo "$(date --iso-8601=seconds) │ $line"
  done >>"$logs_dir"/deployment.log
