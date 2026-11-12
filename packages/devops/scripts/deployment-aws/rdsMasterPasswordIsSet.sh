#!/usr/bin/env bash
# When run within an EC2 instance, checks (once) whether the master password of a deployment’s RDS
# instance has been reset since the instance was restored from its snapshot.
#
# Non-production databases are cloned from a production snapshot, and then given their own master
# password by the ‘deployment’ Lambda function. That reset is asynchronous, and until it’s applied
# the database accepts connections but rejects the new password.
#
# USAGE
#   rdsMasterPasswordIsSet.sh <deployment-name>
#
# EXIT STATUS
#   0  Master password has been reset.
#   1  Not yet. Reason is printed to stdout; worth trying again.
#   2  Couldn’t tell, and waiting won’t help (e.g. access denied). Error is printed to stderr.
#
# REMARKS
#   - Needs rds:DescribeDBInstances and rds:DescribeEvents.
#   - `aws rds describe-events` doesn’t return event IDs, so RDS-EVENT-0016 and RDS-EVENT-0067 are
#     matched by message. See
#     https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Events.Messages.html
set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
. "$script_dir/../../../../scripts/bash/ansiControlSequences.sh"

if (($# == 0)); then
	this_script=$(basename "${BASH_SOURCE[0]}")
	{
		echo -en "${BOLD}${RED}Missing argument.${RESET} "
		echo -e "Please specify the deployment name. Example usage:"
		echo
		echo -e "  ${GREEN}path/to/$this_script ${BLUE}my-deployment${RESET}"
	} >&2
	exit 2
fi

deployment_name=$1
db_id=tupaia-$deployment_name

# RDS keeps events for 14 days. An instance older than this has no reset event left to find, but
# has long since had its password set.
declare -ir event_lookback_seconds=1123200 # 13 days

availability_zone=$(ec2metadata --availability-zone)
region=${availability_zone::-1}

# Prints the output of `aws rds …`. If the command fails, exits the script with 1 if the instance
# doesn’t exist (yet), or 2 otherwise.
query_rds() {
	local output
	if output=$(aws rds "$@" --region "$region" --output text 2>&1); then
		printf '%s\n' "$output"
		return
	fi

	if [[ $output = *DBInstanceNotFound* ]]; then
		echo "$db_id doesn’t exist yet"
		exit 1
	fi

	{
		echo -e "${BOLD}${RED}Couldn’t query RDS about $db_id.${RESET}"
		echo "$output"
	} >&2
	exit 2
}

# Command substitution runs `query_rds` in a subshell, so its `exit` has to be propagated by hand
instance=$(
	query_rds describe-db-instances \
		--db-instance-identifier "$db_id" \
		--query 'DBInstances[0].[DBInstanceStatus, PendingModifiedValues.MasterUserPassword, InstanceCreateTime]'
) || {
	status=$?
	if [[ -n $instance ]]; then echo "$instance"; fi
	exit "$status"
}
read -r instance_status pending_password created_at <<<"$instance"

if [[ $instance_status != available ]]; then
	echo "$db_id is $instance_status"
	exit 1
fi

if [[ $pending_password != None ]]; then
	echo "Reset is pending on $db_id"
	exit 1
fi

declare -i age_seconds=$(($(date +%s) - $(date --date="$created_at" +%s)))
if ((age_seconds > event_lookback_seconds)); then
	exit 0
fi

# Being ‘available’ with nothing pending isn’t enough on its own: that’s also how the instance
# looks before the reset has been requested. Starting from the instance’s creation ignores events
# from any earlier instance with the same identifier.
events=$(
	query_rds describe-events \
		--source-type db-instance \
		--source-identifier "$db_id" \
		--start-time "$created_at" \
		--query 'Events[].Message'
) || {
	status=$?
	if [[ -n $events ]]; then
		echo "$events"
	fi
	exit "$status"
}

if [[ $events = *'Unable to reset your password'* ]]; then
	{
		echo -e "${BOLD}${RED}RDS couldn’t reset the master password of $db_id.${RESET}"
		echo "See the instance’s events in the RDS console."
	} >&2
	exit 2
fi

if [[ $events != *'Reset master credentials'* ]]; then
	echo "Reset hasn’t been requested for $db_id yet"
	exit 1
fi
