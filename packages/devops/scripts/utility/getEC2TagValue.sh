#!/usr/bin/env bash
# When run within an EC2 instance, given the name of a tag, prints the value of that tag. If no
# value is found, prints `None` (sans-backticks).
#
# REMARKS
#   - getEC2TagValue.sh is a dependency of startupTupaia.sh and startupLesmis.sh, which are packaged
#     into the code for the ‘deployment’ Lambda function.
#   - The version of getEC2TagValue.sh invoked by startupTupaia.sh and startupLesmis.sh is always
#     from the default branch. (The code in those scripts responsible for fetching new code from
#     version control depend on instance tags fetched with getEC2TagValue.sh.)
#
#   To deploy changes to getEC2TagValue.sh that need to be “seen” by either of the startup scripts:
#
#   1. Merge code change into the default branch (dev).
#   2. Go to EC2 Image Builder → Image pipelines → Tupaia Gold Master and run the pipeline. (This
#      affects ALL deployments, including production. Ensure the code change is backward-
#      compatible.)
set -e

tag_name=$1

instance_id=$(ec2metadata --instance-id)
availability_zone=$(ec2metadata --availability-zone)
region=${availability_zone::-1}

aws ec2 describe-tags \
	--filters "Name=resource-id,Values=$instance_id" "Name=key,Values=$tag_name" \
	--region "$region" \
	--query 'Tags[0].Value' \
	--output 'text'
