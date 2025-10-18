#!/usr/bin/env bash
set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
root_dir=$(realpath -- "$script_dir"/../../../..)

declare -a required=(
    BW_CLIENTID
    BW_CLIENTSECRET
    BW_PASSWORD
    DEFAULT_FRONTEND
    DEPLOYMENT_NAME
    DOMAIN
    GIT_BRANCH
    GIT_REPO
    USE_SSL
)

declare -i any_missing=0
for varname in "${required[@]}"; do
    if [[ ! -v $varname ]]; then
        any_missing=1
        break
    fi
done

# Short-circuit with silent output on success
if ((any_missing == 0)); then
    exit 0
fi

# Subsequent outputs to stderr
exec 1>&2

. "$root_dir/scripts/bash/ansiControlSequences.sh"

summary='' # Table in CSV format
for varname in "${required[@]}"; do
    if [[ -v $varname ]]; then
        summary+="${BOLD}${GREEN}✓${RESET},"
        summary+="${BOLD}${varname}${RESET},"
        summary+="${GREEN}is set${RESET}\n"
    else
        summary+="${BOLD}${RED}×${RESET},"
        summary+="${BOLD}${varname}${RESET},"
        summary+="${RED}is missing${RESET}\n"
    fi
done

echo -e "${BOLD}${RED}Missing environment variables.${RESET} These variables are required:"
echo
echo -e "$summary" |
    column -t -s , | # Pretty print CSV as table
    sed 's/^/  /'    # Indent by two wordspaces

exit 1
