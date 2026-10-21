#!/usr/bin/env bash
# Waits until this deployment’s database is accepting connections, giving up after
# DB_WAIT_TIMEOUT_SECONDS (default 600).
#
# Using `pg_isready` only for simplicity; a more robust check would attempt a login with `psql`.
set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
tupaia_dir=$(realpath -- "$script_dir"/../../../..)

source "$tupaia_dir"/scripts/bash/ansiControlSequences.sh

if ! "$tupaia_dir"/scripts/bash/requireCommands.sh dig pg_isready; then
	exit 1
fi

source "$tupaia_dir"/scripts/bash/mergeEnvForDB.sh
: "${DB_PORT:=5432}"
: "${DB_WAIT_TIMEOUT_SECONDS:=600}"
: "${DB_WAIT_INTERVAL_SECONDS:=15}"

for int_var in DB_WAIT_TIMEOUT_SECONDS DB_WAIT_INTERVAL_SECONDS; do
	if [[ ! ${!int_var} =~ ^[1-9][0-9]*$ ]]; then
		echo -en "${BOLD}${RED}Invalid environment variable.${RESET} " >&2
		echo -e "${BOLD}$int_var${RESET} must be a natural number of seconds." >&2
		exit 1
	fi
done

if [[ -z $DB_URL ]]; then
	echo -en "${BOLD}${RED}Missing environment variable.${RESET} " >&2
	echo -e "${BOLD}DB_URL${RESET} must be set in env/db.env." >&2
	exit 1
fi

# Look for the record on the zone’s own nameservers rather than through the local resolver. Asking a
# resolver about a name that doesn’t exist yet makes it cache that answer (for up to 15 min with
# tupaia.org’s SOA), which would keep the database out of reach after the record is created.
zone=${DB_URL#*.}
declare -a authoritative_nameservers=()

record_is_published() {
	if ((${#authoritative_nameservers[@]} == 0)); then
		# dig can print ‘;;’ diagnostics to stdout even with +short, so keep only hostnames
		readarray -t authoritative_nameservers < <(
			dig +short NS "$zone" 2>/dev/null | grep -E '^[A-Za-z0-9.-]+$'
		)
		if ((${#authoritative_nameservers[@]} == 0)); then
			failure_detail="Couldn’t find the nameservers for $zone"
			return 1
		fi
	fi

	local nameserver response
	for nameserver in "${authoritative_nameservers[@]}"; do
		response=$(dig +norecurse +time=5 +tries=1 +noall +comments +answer "$DB_URL" @"$nameserver" 2>&1) ||
			continue
		# Anything but NOERROR or NXDOMAIN (e.g. REFUSED, SERVFAIL) says nothing about the record
		if [[ $response =~ status:\ (NOERROR|NXDOMAIN) ]]; then
			grep -q '^[^;]' <<<"$response"
			return
		fi
	done

	failure_detail="None of the nameservers for $zone gave an answer"
	return 1
}

# Sets `failure` (and `failure_detail`, if there is any) to the first check that doesn’t pass
database_is_ready() {
	failure_detail=

	if ! record_is_published; then
		failure="$DB_URL isn’t in DNS yet"
		return 1
	fi

	local status=0
	pg_isready --host="$DB_URL" --port="$DB_PORT" --timeout=5 || status=$?
	if ((status == 3)); then
		# No connection was attempted because of an invalid parameter, so waiting won’t help
		echo -en "${BOLD}${RED}Invalid connection parameters.${RESET} " >&2
		echo "pg_isready exited with code 3. Check DB_URL, DB_PORT and any PG* environment variables." >&2
		exit 1
	elif ((status != 0)); then
		failure='Database not yet accepting connections'
		return 1
	fi
}

format_duration() {
	local minutes=$(($1 / 60))
	local seconds=$(($1 % 60))
	printf '%dm %02ds\n' "$minutes" "$seconds"
}

min() {
	echo $(($1 < $2 ? $1 : $2))
}

echo -e "${BLUE}==>️${RESET} ${BOLD}Waiting for database at $DB_URL${RESET}"

declare -i start_time=$SECONDS
until database_is_ready; do
	declare -i elapsed=$((SECONDS - start_time))
	if ((elapsed >= DB_WAIT_TIMEOUT_SECONDS)); then
		echo -en "${BOLD}${RED}Database not ready after $(format_duration "$elapsed").${RESET} " >&2
		echo "Last check: $failure" >&2
		if [[ -n $failure_detail ]]; then
			echo "$failure_detail" >&2
		fi
		exit 1
	fi

	echo "Waiting… ($(format_duration "$elapsed")): $failure${failure_detail:+ (${failure_detail%%$'\n'*})}"
	sleep "$(min "$DB_WAIT_INTERVAL_SECONDS" $((DB_WAIT_TIMEOUT_SECONDS - elapsed)))"
done

duration=$(format_duration $((SECONDS - start_time)))
echo "Database ready (waited $duration)"
