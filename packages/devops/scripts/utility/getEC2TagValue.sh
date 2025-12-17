#!/usr/bin/env bash
# Get the stage tag of this ec2 instance from AWS
set -e

TAG_NAME=$1
INSTANCE_ID="$(wget -qO- http://instance-data/latest/meta-data/instance-id)"
REGION="`wget -qO- http://instance-data/latest/meta-data/placement/availability-zone | sed -e 's:\([0-9][0-9]*\)[a-z]*\$:\\1:'`"
TAG_VALUE="$(aws ec2 describe-tags --filters "Name=resource-id,Values=$INSTANCE_ID" "Name=key,Values=$TAG_NAME" --region $REGION --output=text | cut -f5)"
echo $TAG_VALUE
