#!/usr/bin/env bash
set -e +x

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
tupaia_dir=$(realpath -- "$script_dir"/../../../..)

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

echo
echo 'Connecting to bes.au Tailnet...'
echo "  Auth key:  $auth_key_param_name (from Parameter Store)"
echo "  Tags:      $tags"

sudo tailscale up \
	--auth-key="$("$script_dir"/fetchParameterStoreValue.sh "$auth_key_param_name")" \
	--ssh \
	--advertise-tags="$tags"

echo
echo 'Connected to bes.au Tailnet'
