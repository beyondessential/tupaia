#!/usr/bin/env bash
# Uploads this server's Munin history and logs to S3, keyed by deployment (and instance, for
# logs), so they outlive the instance: each redeploy replaces it, and its replacement restores
# Munin from here. Runs hourly from cron, when the instance shuts down or is terminated
# (tupaia-flush.service), and when the deployment Lambda is about to replace it.
#
# With --final (from the deployment Lambda), it marks this server as superseded once the upload
# succeeds: its replacement restores from that upload and then owns the deployment's Munin history,
# so later runs here (hourly, and at termination after the swap) upload logs only and never
# overwrite the replacement's newer data.
#
# --final also hands the deployment's Tailscale identity (its node: name, address, Canopy binding)
# to the replacement: it uploads the node's state, then rejoins the tailnet under a throwaway
# ephemeral identity as <name>-retiring, so this server stays reachable if the swap goes wrong and
# disappears from the tailnet once it's terminated. It exits non-zero if the handover fails, and
# then the Lambda doesn't let the replacement take the identity: two servers can't share a node.
#
# Configured by setupObservability.sh in /etc/default/tupaia-flush.
set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

source /etc/default/tupaia-flush

hand_over_tailscale_identity() {
	local state=/var/lib/tailscale
	if [[ ! -e $state/tailscaled.state ]]; then
		echo 'No Tailscale identity to hand over'
		return
	fi

	local self hostname tags
	self=$(tailscale status --json 2>/dev/null | jq -c '.Self // {}') || self='{}'
	hostname=$(jq -r '.HostName // empty' <<<"$self")
	tags=$(jq -r '(.Tags // []) | join(",")' <<<"$self")

	local archive
	archive=$(mktemp)
	systemctl stop tailscaled
	tar -C "$state" -czf "$archive" .
	if ! aws s3 cp --only-show-errors "$archive" "s3://$BUCKET/tailscale/$DEPLOYMENT_NAME/identity.tgz"; then
		rm -f "$archive"
		systemctl start tailscaled
		echo 'Could not upload the Tailscale identity; keeping it' >&2
		return 1
	fi
	rm -f "$archive"

	# Not `tailscale logout`, which would invalidate the identity just handed over
	rm -rf "$state.handed-over"
	mv "$state" "$state.handed-over"
	systemctl start tailscaled

	local key
	key=$("$script_dir"/fetchParameterStoreValue.sh /tupaia/tailscale/retiring-auth-key 2>/dev/null) || key=
	if [[ -z $key ]]; then
		echo 'No retiring auth key; leaving the tailnet'
		systemctl stop tailscaled
		return
	fi
	tailscale up \
		--auth-key="$key" \
		--hostname="${hostname:-tupaia-$DEPLOYMENT_NAME}-retiring" \
		--ssh \
		${tags:+--advertise-tags="$tags"} ||
		echo 'Could not rejoin the tailnet as retiring' >&2
	echo "Handed over the Tailscale identity; now ${hostname:-tupaia-$DEPLOYMENT_NAME}-retiring"
}

superseded=/var/lib/tupaia-flush/superseded

if [[ -e $superseded ]]; then
	echo 'Superseded by a replacement; not uploading Munin history'
else
	aws s3 sync --only-show-errors --delete /var/lib/munin/ "s3://$BUCKET/munin/$DEPLOYMENT_NAME/"
	if [[ ${1:-} == --final ]]; then
		mkdir -p "${superseded%/*}"
		touch "$superseded"
	fi
fi

# No --delete: rotated-away logs stay in S3 until the bucket's retention expires them
logs="s3://$BUCKET/logs/$DEPLOYMENT_NAME/$INSTANCE_ID"
for dir in /home/ubuntu/logs /home/ubuntu/.pm2/logs /var/log/nginx; do
	if [[ -d $dir ]]; then
		aws s3 sync --only-show-errors "$dir/" "$logs$dir/"
	fi
done
aws s3 cp --only-show-errors /var/log/cloud-init-output.log "$logs/var/log/cloud-init-output.log" || true

if [[ ${1:-} == --final ]]; then
	hand_over_tailscale_identity
fi
