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

if ! "$tupaia_dir"/scripts/bash/requireCommands.sh "$script_dir"/fetchParameterStoreValue.sh tailscale; then
	exit 1
fi

if [[ $DEPLOYMENT_NAME = production ]]; then
	auth_key_param_name=TAILSCALE_AUTH_KEY_PROD
	tags=tag:server,tag:server-tupaia,tag:server-tupaia-prod
	hostname=tupaia-prod-$DEPLOYMENT_NAME
else
	auth_key_param_name=TAILSCALE_AUTH_KEY_STAGING
	tags=tag:server,tag:server-tupaia,tag:server-tupaia-staging
	hostname=tupaia-staging-$DEPLOYMENT_NAME
fi

echo
echo 'Connecting to bes.au Tailnet...'
echo "  Auth key:  $auth_key_param_name (from Parameter Store)"
echo "  Hostname:  $hostname"
echo "  Tags:      $tags"

# When the server this one replaces handed its Tailscale identity over (the deployment Lambda tags
# this instance only then), take over its node: same name, address and Canopy binding, rather
# than a new node per redeploy. See flushToS3.sh for the other side.
restore_identity() {
	[[ $("$script_dir"/../utility/getEC2TagValue.sh TailscaleIdentity) == handed-over ]] || return 1

	local bucket archive
	bucket=$("$script_dir"/fetchParameterStoreValue.sh /tupaia/servers/bucket 2>/dev/null) || return 1
	archive=$(mktemp)
	if ! aws s3 cp --only-show-errors "s3://$bucket/tailscale/$DEPLOYMENT_NAME/identity.tgz" "$archive"; then
		rm -f "$archive"
		return 1
	fi

	echo "  Taking over the deployment's node from s3://$bucket/tailscale/$DEPLOYMENT_NAME/"
	sudo systemctl stop tailscaled
	sudo rm -rf /var/lib/tailscale
	sudo install -d -m 0700 /var/lib/tailscale
	sudo tar -C /var/lib/tailscale -xzpf "$archive"
	rm -f "$archive"
	sudo systemctl start tailscaled

	sudo tailscale up --reset --hostname="$hostname" --ssh --advertise-tags="$tags" --timeout=60s &&
		[[ $(tailscale status --json | jq -r .BackendState) == Running ]]
}

if ! restore_identity; then
	# Never half a restored identity: start clean as a new node
	if [[ -e /var/lib/tailscale/tailscaled.state ]]; then
		sudo systemctl stop tailscaled
		sudo rm -rf /var/lib/tailscale
		sudo systemctl start tailscaled
	fi
	echo '  Joining as a new node'
	sudo tailscale up \
		--auth-key="$("$script_dir"/fetchParameterStoreValue.sh "$auth_key_param_name")" \
		--hostname="$hostname" \
		--ssh \
		--advertise-tags="$tags"
fi

echo
echo 'Connected to bes.au Tailnet'
