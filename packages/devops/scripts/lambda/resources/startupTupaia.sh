#!/bin/bash -leE
# This script gets loaded as "User Data" against the EC2 instance, and deploys the tagged branch
# the first time the instance starts
#
# REMARK
#   The production version of this script lives in the ‘deployment’ Lambda function; simply merging
#   does not deploy code changes to production. To make changes, see
#   https://beyond-essential.slab.com/posts/making-changes-to-deployment-process-9kjpcjic

set -o pipefail # fail pipe where scripts are e.g. piped out to deployment logs

declare -i start_time=$(date +%s)

home_dir=/home/ubuntu
logs_dir=$home_dir/logs
deployment_scripts=$home_dir/tupaia/packages/devops/scripts/deployment-aws

# Create a directory for logs to go
mkdir -m 777 -p "$logs_dir"

# Add tag for CI/CD to use as a health check
instance_id=$(ec2metadata --instance-id)
aws ec2 create-tags --resources "$instance_id" --tags Key=StartupBuildProgress,Value=building

# Mark the build progress as errored if anything goes wrong
tag_errored() {
  aws ec2 create-tags --resources "$instance_id" --tags Key=StartupBuildProgress,Value=errored
  service nginx stop # stop nginx as an obvious sign the build has failed

  declare -i duration=$(($(date +%s) - start_time))
  local message="Startup failed after $((duration / 60)) min $((duration % 60)) s"
  echo "$message" # to cloud-init output log
  echo "$(date --iso-8601=seconds) │ $message" >>"$logs_dir"/deployment.log
}
trap tag_errored ERR

deployment_name=$("$deployment_scripts"/../utility/getEC2TagValue.sh DeploymentName)

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

main() {
  local home_dir=/home/ubuntu
  local tupaia_dir=$home_dir/tupaia
  local logs_dir=$home_dir/logs
  local deployment_scripts=$tupaia_dir/packages/devops/scripts/deployment-aws
  local deployment_name=$("$deployment_scripts"/../utility/getEC2TagValue.sh DeploymentName)
  local branch=$("$deployment_scripts"/../utility/getEC2TagValue.sh Branch)
  local instance_id=$(ec2metadata --instance-id)

  schedule_preaggregation_job() {
    echo "10 13 * * * $home_dir/tupaia/packages/web-config-server/run_preaggregation.sh | while IFS= read -r line; do echo \"\$(date --iso-8601=seconds) │ \$line\"; done > $logs_dir/preaggregation.txt" >tmp.cron
    crontab -l >>tmp.cron || echo >>tmp.cron
    crontab tmp.cron
    rm tmp.cron
  }

  fetch_latest_code() {
    cd "$tupaia_dir"
    if git ls-remote --exit-code --heads origin "$branch" &>/dev/null; then
      echo "Fetching latest code from branch $branch..."
      local branch_to_use=$branch
    else
      echo "Branch $branch doesn’t exist. Fetching latest code from dev..."
      local branch_to_use=dev
    fi
    set -x
    git remote set-branches --add origin "$branch_to_use"
    git fetch --all --prune
    git reset --hard # clear out any manual changes that have been made, which would cause checkout to fail
    git switch "$branch_to_use"
    git reset --hard origin/"$branch_to_use"
    set +x
  }

  echo "Starting up $deployment_name ($branch)"

  # Turn on cloudwatch agent for prod and dev (can be turned on manually if needed on feature instances)
  # TODO currently broken
  # if [[ $deployment_name = production || $deployment_name = dev ]]; then
  #   $deployment_scripts/startCloudwatchAgent.sh
  # fi

  fetch_latest_code

  if [[ $deployment_name = production ]]; then
    schedule_preaggregation_job
  fi

  # central-server and data-table-server need Tailnet access for external database connections
  DEPLOYMENT_NAME="$deployment_name" "$deployment_scripts"/connectTailscale.sh
  # Build each package, including injecting environment variables from Bitwarden
  "$deployment_scripts"/buildDeployablePackages.sh "$deployment_name"
  # Deploy each package
  "$deployment_scripts"/../deployment-common/startBackEnds.sh
  # Set nginx config and start the service running
  sudo -E DEPLOYMENT_NAME="$deployment_name" "$deployment_scripts"/configureNginx.sh

  # Tag as complete so CI/CD system can use the tag as a health check
  aws ec2 create-tags --resources "$instance_id" --tags Key=StartupBuildProgress,Value=complete

  declare -i duration=$(($(date +%s) - start_time))
  echo "Startup completed in $((duration / 60)) min $((duration % 60)) s"
}

# Run main() as the ubuntu user.
#
# The function is written to a file rather than passed to `bash -c`, because sudo exports its entire
# command line as SUDO_COMMAND. A function body full of quotes and `$(…)` breaks any descendant
# process that parses the environment, notably scripts/bash/mergeEnvForDB.sh.
main_script=$(mktemp /tmp/startupTupaia.XXXXXX)
chmod 644 "$main_script" # sudo runs it as ubuntu, but mktemp creates it owned by root
trap 'rm -f "$main_script"' EXIT
{
  # sudo’s env_reset drops variables inherited from this shell, so bake in the ones main() needs
  printf 'declare -i start_time=%d\n' "$start_time"
  declare -f main
  printf 'main\n'
} >"$main_script"

sudo -Hu ubuntu bash -leE "$main_script" |&
  while IFS= read -r line; do
    echo "$(date --iso-8601=seconds) │ $line"
  done >>"$logs_dir"/deployment.log
