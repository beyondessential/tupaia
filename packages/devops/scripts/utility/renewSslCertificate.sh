#!/bin/bash

# Exit when any command fails
set -e

DIR=$(dirname "$0")
STAGE=$(${DIR}/getEC2TagValue.sh Stage)
AWS_PROFILE=certbot

if [[ $STAGE == "production" ]]; then
    echo "Renewing certificates on production"
    /usr/local/bin/certbot-auto renew --no-self-upgrade --dns-route53 --non-interactive --server https://acme-v02.api.letsencrypt.org/directory --post-hook "sudo service nginx reload"
else
    echo "Not renewing certificates on ${STAGE}"
fi
