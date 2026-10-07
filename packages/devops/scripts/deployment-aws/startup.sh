#!/usr/bin/env bash
# Builds and starts this branch's Tupaia on a fresh server. The deployment Lambda's boot script
# (in the `tupaia-infra` Pulumi stack, at pulumi/tupaia/infra in beyondessential/ops) checks out
# the branch, then runs this as root with DEPLOYMENT_NAME and BRANCH set, logging its output and
# tagging the instance with how it went. Changes here ship with the branch, so they can be tried on a branch deployment.
set -eEo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
tupaia_dir=$(realpath -- "$script_dir"/../../../..)
home_dir=/home/ubuntu
logs_dir=$home_dir/logs

if [[ ! -v DEPLOYMENT_NAME || ! -v BRANCH ]]; then
	echo 'DEPLOYMENT_NAME and BRANCH must be set' >&2
	exit 2
fi

# Put the deployment name in the bash prompt
set_prompt() {
	local reset='\e[m'
	local bold_red='\e[1;31m'
	local bold_green='\e[1;32m'
	local bold_blue='\e[1;34m'
	local bold_cyan='\e[1;36m'
	if [[ $DEPLOYMENT_NAME = production ]]; then
		local username_format=$bold_red
	else
		local username_format=$bold_cyan
	fi

	local prompt='\['                              # begin non-printing chars
	prompt+='\e]0;'                                #   begin window title
	prompt+="\\u@$DEPLOYMENT_NAME: \\w"            #    e.g. 'username@deployment-name: ~'
	prompt+='\a'                                   #   end window title
	prompt+='\]'                                   # end non-printing chars
	prompt+='${debian_chroot:+($debian_chroot)}'   # debian_chroot, if set (else nothing)
	prompt+=$bold_green\\u$reset                   # username
	prompt+=@                                      # '@'
	prompt+=$username_format$DEPLOYMENT_NAME$reset # deployment name
	prompt+=:                                      # ':'
	prompt+=$bold_blue\\w$reset                    # working directory
	prompt+='\$ '                                  # '#' if uid is 0, else '$', followed by trailing wordspace

	echo "PS1=${prompt@Q}" >>"$home_dir"/.bashrc
}

schedule_preaggregation_job() {
	{
		echo "10 13 * * * $tupaia_dir/packages/web-config-server/run_preaggregation.sh | while IFS= read -r line; do echo \"\$(date --iso-8601=seconds) │ \$line\"; done > $logs_dir/preaggregation.txt"
		sudo -Hu ubuntu crontab -l || true # non-zero when ubuntu has no crontab yet
	} | sudo -Hu ubuntu crontab -
}

echo "Starting up $DEPLOYMENT_NAME ($BRANCH)"

set_prompt

if [[ $DEPLOYMENT_NAME = production ]]; then
	schedule_preaggregation_job
fi

# central-server and data-table-server need Tailnet access for external database connections
sudo -Hu ubuntu DEPLOYMENT_NAME="$DEPLOYMENT_NAME" "$script_dir"/connectTailscale.sh
# Build each package, including injecting environment variables from Bitwarden
sudo -Hu ubuntu "$script_dir"/buildDeployablePackages.sh "$DEPLOYMENT_NAME"
# Deploy each package
sudo -Hu ubuntu "$script_dir"/../deployment-common/startBackEnds.sh
# Set nginx config and start the service running
DEPLOYMENT_NAME="$DEPLOYMENT_NAME" "$script_dir"/configureNginx.sh
# Monitoring must never fail a deployment
DEPLOYMENT_NAME="$DEPLOYMENT_NAME" "$script_dir"/setupObservability.sh || echo 'Observability setup failed; continuing without it'
