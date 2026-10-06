#!/usr/bin/env bash
# Called as root by startupTupaia.sh once the deployment is up. Sets up, per deployment name:
#   - Munin, restoring its history from S3 (each redeploy is a new instance) and serving it on
#     the tailnet at https://<node>:4950, and at svc:munin-tupaia-<deployment> where that exists
#   - bestool alertd, only for deployments with a Canopy registration in Parameter Store, so every
#     instance of e.g. production reports as the same Canopy machine and branch deployments never
#     appear in Canopy
#
# The bucket, the registrations and the tailnet services are managed by the `tupaia` Pulumi stack
# in beyondessential/ops.
set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

if [[ ! -v DEPLOYMENT_NAME ]]; then
	echo 'DEPLOYMENT_NAME must be set' >&2
	exit 2
fi

# Prints nothing when the parameter is absent
parameter() {
	"$script_dir"/fetchParameterStoreValue.sh "$1" 2>/dev/null || true
}

setup_munin() {
	local bucket
	bucket=$(parameter /tupaia/munin/bucket)
	if [[ -n $bucket ]]; then
		local prefix="s3://$bucket/$DEPLOYMENT_NAME/"
		echo "Restoring Munin history from $prefix"
		aws s3 sync --only-show-errors "$prefix" /var/lib/munin/
		chown -R munin:munin /var/lib/munin
		echo "17 * * * * root aws s3 sync --only-show-errors --delete /var/lib/munin/ $prefix" >/etc/cron.d/munin-s3-sync
	else
		echo 'No Munin bucket configured; history will start afresh'
	fi

	systemctl restart munin-node

	tailscale serve --bg --https=4950 /var/cache/munin/www
	local service="svc:munin-tupaia-$DEPLOYMENT_NAME"
	if tailscale serve --service="$service" --https=443 /var/cache/munin/www; then
		echo "Munin advertised as $service"
	else
		echo "Not advertising $service (not defined on the tailnet, or not approved for this node)"
	fi
}

setup_alertd() {
	local blob
	blob=$(parameter "/tupaia/canopy/$DEPLOYMENT_NAME/blob")
	if [[ -z $blob ]]; then
		echo "No Canopy registration for $DEPLOYMENT_NAME; alertd stays off"
		return
	fi

	local passphrase_file
	passphrase_file=$(mktemp)
	chmod 0600 "$passphrase_file"
	parameter "/tupaia/canopy/$DEPLOYMENT_NAME/passphrase" >"$passphrase_file"
	bestool canopy import --passphrase-path "$passphrase_file" <<<"$blob"
	rm -f "$passphrase_file"

	# The packaged unit expects these to exist (written to by backups on Tamanu servers)
	mkdir -p /etc/bestool /var/lib/kopia
	systemctl enable --now bestool-alertd.service
	echo "alertd reporting to Canopy as $DEPLOYMENT_NAME"
}

setup_munin
setup_alertd
