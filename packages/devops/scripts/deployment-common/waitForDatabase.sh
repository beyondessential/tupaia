#!/usr/bin/env bash
# Waits until this deployment’s database can be reached and logged into, or gives up after
# DB_WAIT_TIMEOUT_SECONDS (default 600).
#
# A fresh staging deployment’s server is launched before its database has finished restoring from a
# snapshot. The [deployment-name]-db.tupaia.org record is only created once the restore is done, and
# the master password is reset after that, so the database can lag well behind the build.
set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
tupaia_dir=$(realpath -- "$script_dir"/../../../..)

source "$tupaia_dir"/scripts/bash/ansiControlSequences.sh

if ! "$tupaia_dir"/scripts/bash/requireCommands.sh getent pg_isready psql; then
	exit 1
fi

source "$tupaia_dir"/scripts/bash/mergeEnvForDB.sh
: "${DB_PORT:=5432}"
: "${DB_WAIT_TIMEOUT_SECONDS:=600}"
: "${DB_WAIT_INTERVAL_SECONDS:=15}"

for int_var in DB_WAIT_TIMEOUT_SECONDS DB_WAIT_INTERVAL_SECONDS; do
	if ! { [[ ${!int_var} =~ ^[0-9]+$ ]] && ((int_var > 0)); }; then
		echo -en "${BOLD}${RED}Invalid environment variable.${RESET} " >&2
		echo -e "${BOLD}$int_var${RESET} must be a natural number of seconds." >&2
		exit 1
	fi
done

for var in DB_URL DB_NAME DB_PG_USER DB_PG_PASSWORD; do
	if [[ -z ${!var} ]]; then
		echo -en "${BOLD}${RED}Missing environment variable.${RESET} " >&2
		echo -e "${BOLD}$var${RESET} must be set in env/db.env or env/pg.env." >&2
		exit 1
	fi
done

# Prevent stray libpq settings from redirecting or weakening the checks (PGHOSTADDR overrides --host)
unset PGHOSTADDR PGSERVICE PGSERVICEFILE PGOPTIONS PGSSLMODE

# Match server process behaviour, which connect over SSL when this is set (see getConnectionConfig.js)
if [[ $DB_ENABLE_SSL = true ]]; then
	export PGSSLMODE=require
fi

is_ip() {
	[[ $1 =~ ^[0-9]+(\.[0-9]+){3}$ || $1 = *:* ]]
}

# Look for the record on the zone’s own nameserver rather than through the local resolver. Asking a
# resolver about a name that doesn’t exist yet makes it cache that answer (for up to 15 min with
# tupaia.org’s SOA), which would keep the database out of reach after the record is created.
authoritative_nameserver=
parent_domain=${DB_URL#*.}
if ! is_ip "$DB_URL" && [[ $parent_domain = *.* ]] && command -v dig &>/dev/null; then
	# dig can print ‘;;’ diagnostics to stdout even with +short, so keep only a hostname
	authoritative_nameserver=$(
		dig +short NS "$parent_domain" 2>/dev/null | grep -m1 -E '^[A-Za-z0-9.-]+$'
	) || true
fi

record_is_published() {
	local answer
	# If the nameserver can’t be reached, leave it to the local resolver
	answer=$(dig +short +norecurse +time=5 +tries=1 "$DB_URL" @"$authoritative_nameserver" 2>&1) || return 0
	[[ -n $answer ]]
}

# Sets `failure` (and `failure_detail`, if there is any) to the first check that doesn’t pass
check_database() {
	failure_detail=

	if [[ -n $authoritative_nameserver ]] && ! record_is_published; then
		failure="$DB_URL isn’t in DNS yet"
		return 1
	fi

	if ! getent hosts "$DB_URL" >/dev/null; then
		# Clear any negative answer cached before the record existed, but only once: it needs root and
		# empties the cache for the whole host
		if [[ -z $flushed_dns_cache ]]; then
			sudo -n resolvectl flush-caches &>/dev/null || true
			flushed_dns_cache=1
		fi
		failure="$DB_URL doesn’t resolve on this host yet"
		return 1
	fi

	if ! failure_detail=$(pg_isready --host="$DB_URL" --port="$DB_PORT" --timeout=5 2>&1); then
		failure='the database isn’t accepting connections yet'
		return 1
	fi

	# DB_PG_USER is the first user to connect (see install-mv-refresh). Checking it also covers the
	# master password still being reset.
	if ! failure_detail=$(
		PGCONNECT_TIMEOUT=10 PGPASSWORD=$DB_PG_PASSWORD psql \
			--host="$DB_URL" \
			--port="$DB_PORT" \
			--username="$DB_PG_USER" \
			--dbname="$DB_NAME" \
			--no-psqlrc \
			--command='SELECT 1' \
			2>&1 >/dev/null
	); then
		failure="$DB_PG_USER can’t log in yet"
		return 1
	fi
}

format_duration() {
	echo "$(($1 / 60))m $(($1 % 60))s"
}

min() {
	echo $(($1 < $2 ? $1 : $2))
}

echo -e "${BLUE}==>️${RESET} ${BOLD}Waiting for database at $DB_URL${RESET}"

declare -i start_time=$SECONDS
until check_database; do
	declare -i elapsed=$((SECONDS - start_time))
	if ((elapsed >= DB_WAIT_TIMEOUT_SECONDS)); then
		echo -en "${BOLD}${RED}Database not ready after $(format_duration "$elapsed").${RESET} " >&2
		echo "Last check: $failure" >&2
		if [[ -n $failure_detail ]]; then
			echo "$failure_detail" >&2
		fi
		exit 1
	fi

	echo "Waiting for database ($(format_duration "$elapsed")): $failure"
	sleep "$(min "$DB_WAIT_INTERVAL_SECONDS" $((DB_WAIT_TIMEOUT_SECONDS - elapsed)))"
done

duration=$(format_duration $((SECONDS - start_time)))
echo "Database ready (waited $duration)"
