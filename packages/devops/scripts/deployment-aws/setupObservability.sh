#!/usr/bin/env bash
# Called as root by startupTupaia.sh once the deployment is up. Sets up, per deployment name:
#   - Uploading Munin history and logs to S3 (hourly, at shutdown, and when the deployment Lambda
#     is about to replace the instance; see flushToS3.sh), and restoring Munin history from there
#   - Munin, served on the tailnet at https://<node>:4950, and at svc:tupaia-<deployment>-svc-munin
#     where that exists
#   - bestool alertd, only for deployments with a Canopy registration in Parameter Store, so every
#     instance of e.g. production reports as the same Canopy machine and branch deployments never
#     appear in Canopy
#
# The bucket, the registrations and the tailnet services are managed by the `tupaia-infra` Pulumi
# stack, at pulumi/tupaia/infra in beyondessential/ops.
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

setup_storage() {
	local bucket
	bucket=$(parameter /tupaia/servers/bucket)
	if [[ -z $bucket ]]; then
		echo 'No server bucket configured; Munin history will start afresh and logs stay local'
		return
	fi

	echo "Restoring Munin history from s3://$bucket/munin/$DEPLOYMENT_NAME/"
	aws s3 sync --only-show-errors "s3://$bucket/munin/$DEPLOYMENT_NAME/" /var/lib/munin/
	chown -R munin:munin /var/lib/munin

	cat >/etc/default/tupaia-flush <<-EOF
		BUCKET=$bucket
		DEPLOYMENT_NAME=$DEPLOYMENT_NAME
		INSTANCE_ID=$(ec2metadata --instance-id)
	EOF
	echo "17 * * * * root $script_dir/flushToS3.sh" >/etc/cron.d/tupaia-flush

	# Its stop runs at shutdown and termination, before the network goes down
	cat >/etc/systemd/system/tupaia-flush.service <<-EOF
		[Unit]
		Description=Upload Munin history and logs to S3 at shutdown
		Wants=network-online.target
		After=network-online.target

		[Service]
		Type=oneshot
		RemainAfterExit=yes
		ExecStart=/bin/true
		ExecStop=$script_dir/flushToS3.sh
		TimeoutStopSec=180

		[Install]
		WantedBy=multi-user.target
	EOF
	systemctl daemon-reload
	systemctl enable --now tupaia-flush.service
}

setup_munin() {
	systemctl restart munin-node

	tailscale serve --bg --https=4950 /var/cache/munin/www
	local service="svc:tupaia-$DEPLOYMENT_NAME-svc-munin"
	if tailscale serve --service="$service" --https=4950 /var/cache/munin/www; then
		echo "Munin advertised as $service"
	else
		echo "Not advertising $service (not defined on the tailnet, or not approved for this node)"
	fi
}

setup_alertd() {
	# A `bestool canopy export` of a server enrolled once by hand, not an enrolment ticket
	local registration
	registration=$(parameter "/tupaia/canopy/$DEPLOYMENT_NAME/registration")
	if [[ -z $registration ]]; then
		echo "No Canopy registration for $DEPLOYMENT_NAME; alertd stays off"
		return
	fi

	local passphrase_file
	passphrase_file=$(mktemp)
	chmod 0600 "$passphrase_file"
	parameter "/tupaia/canopy/$DEPLOYMENT_NAME/passphrase" >"$passphrase_file"
	bestool canopy import --passphrase-path "$passphrase_file" <<<"$registration"
	rm -f "$passphrase_file"

	# The packaged unit expects these to exist (written to by backups on Tamanu servers)
	mkdir -p /etc/bestool /var/lib/kopia
	systemctl enable --now bestool-alertd.service
	echo "alertd reporting to Canopy as $DEPLOYMENT_NAME"
}

setup_storage
setup_munin
setup_alertd
