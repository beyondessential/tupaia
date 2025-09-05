#!/usr/bin/env bash
set -e +x

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
tupaia_dir=$(realpath -- "$script_dir"/../../../..)

if [[ ! -v DEPLOYMENT_NAME ]]; then
	source "$tupaia_dir"/scripts/bash/ansiControlSequences.sh
	this_script=$(basename "${BASH_SOURCE[0]}")
	{
		echo -en "${BOLD}${YELLOW}Missing environment variable.${RESET} "
		echo -e "${BOLD}DEPLOYMENT_NAME${RESET} must be set when ${BOLD}$this_script${RESET} is called."
	} >&2
	exit 2
fi

# Temporary! To avoid needing to rebuild the production Amazon Machine Image
# TODO: Remove this once testing passed
if ! command -v tailscale &>/dev/null; then
	echo 'Tailscale not installed. Installing...'
	curl -fsSL https://tailscale.com/install.sh | sh
fi
echo 'Tailscale version:'
tailscale version

if ! "$tupaia_dir"/scripts/bash/requireCommands.sh "$script_dir"/fetchParameterStoreValue.sh tailscale; then
	exit 1
fi

# TODO: Try exporting TS_AUTHKEY here

if [[ $DEPLOYMENT_NAME = production ]]; then
	auth_key_param_name=TAILSCALE_AUTH_KEY_PROD
	tags=tag:server,tag:server-tupaia,tag:server-tupaia-prod
else
	auth_key_param_name=TAILSCALE_AUTH_KEY_STAGING
	tags=tag:server,tag:server-tupaia,tag:server-tupaia-staging
fi
hostname=tupaia-$DEPLOYMENT_NAME

echo
echo 'Connecting to bes.au Tailnet...'
echo "  Auth key:  $auth_key_param_name (from Parameter Store)"
echo "  Hostname:  $hostname"
echo "  Tags:      $tags"

sudo tailscale up \
	--auth-key="$("$script_dir"/fetchParameterStoreValue.sh "$auth_key_param_name")" \
	--hostname="$hostname" \
	--ssh \
	--advertise-tags="$tags"

echo
echo 'Connected to bes.au Tailnet'
