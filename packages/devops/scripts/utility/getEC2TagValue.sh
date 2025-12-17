#!/usr/bin/env bash
# Get the stage tag of this ec2 instance from AWS
set -e

tag_name=$1

instance_id=$(ec2metadata --instance-id)
availability_zone=$(ec2metadata --availability-zone)
region=${availability_zone::-1}

tag_value=$(aws ec2 describe-tags \
	--filters "Name=resource-id,Values=$instance_id" "Name=key,Values=$tag_name" \
	--region "$region" \
	--output=text |
	cut -f5)

echo $tag_value
