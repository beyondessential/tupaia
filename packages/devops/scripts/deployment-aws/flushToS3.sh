#!/usr/bin/env bash
# Uploads this server's Munin history and logs to S3, keyed by deployment (and instance, for
# logs), so they outlive the instance: each redeploy replaces it, and its replacement restores
# Munin from here. Runs hourly from cron, when the instance shuts down or is terminated
# (tupaia-flush.service), and when the deployment Lambda is about to replace it.
#
# Configured by setupObservability.sh in /etc/default/tupaia-flush.
set -euo pipefail

source /etc/default/tupaia-flush

aws s3 sync --only-show-errors --delete /var/lib/munin/ "s3://$BUCKET/munin/$DEPLOYMENT_NAME/"

# No --delete: rotated-away logs stay in S3 until the bucket's retention expires them
logs="s3://$BUCKET/logs/$DEPLOYMENT_NAME/$INSTANCE_ID"
for dir in /home/ubuntu/logs /home/ubuntu/.pm2/logs /var/log/nginx; do
	if [[ -d $dir ]]; then
		aws s3 sync --only-show-errors "$dir/" "$logs$dir/"
	fi
done
aws s3 cp --only-show-errors /var/log/cloud-init-output.log "$logs/var/log/cloud-init-output.log" || true
