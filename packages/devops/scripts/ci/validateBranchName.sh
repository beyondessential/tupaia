#!/usr/bin/env bash

set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
. "$script_dir"/utils.sh

INVALID_CHARS=('/' '\' '.' '&' '?' '_')

SUBDOMAIN_SUFFIXES=(
    admin
    admin-api
    aggregation
    api
    config
    data-table-api
    datatrak
    datatrak-web-api
    db
    entity
    entity-api
    export
    lesmis
    lesmis-api
    meditrak-api
    mobile
    psss
    psss-api
    report
    report-api
    ssh
    sync-api
    tonga-aggregation
    tupaia-web-api
    www
)

# Branch names are used in AWS EC2 deployments. They are combined with standard suffixes
# to create deployment urls, eg {{branchName}}-tonga-aggregation.tupaia.org
MAX_SUBDOMAIN_LENGTH=64
MAX_SUBDOMAIN_SUFFIX_LENGTH=$(get_max_length "${SUBDOMAIN_SUFFIXES[@]}")
MAX_BRANCH_NAME_LENGTH=$((MAX_SUBDOMAIN_LENGTH - ${MAX_SUBDOMAIN_SUFFIX_LENGTH} - 1)) # Subtract 1 for the connecting `-`
# As of 11/08/21, MAX_BRANCH_NAME_LENGTH = 64 - 17 - 1 = 46 (Longest subdomain "tonga-aggregation")

DEPLOYMENT_WARNING_PREFIX="This branch can't be used for a feature deployment because"

warnings=()

function add_warning() {
    warnings+=("$DEPLOYMENT_WARNING_PREFIX $1")
}

function validate_name_ending() {
    local branch_name=$1

    for suffix in ${SUBDOMAIN_SUFFIXES[@]}; do
        if [[ "$branch_name" == *$suffix ]]; then
            add_warning "its name ends in '$suffix', which is a reserved subdomain suffix"
            return
        fi
        # api is one of our suffixes so makes sure [branch]-api doesn't match any other api suffixes
        if [[ "$suffix" == *-api && $branch_name-api == *$suffix ]]; then
            add_warning "its name would clash with the reserved subdomain suffix '$suffix'"
            return
        fi
    done
}

function validate_name_length() {
    local branch_name=$1
    local name_length=${#branch_name}

    if [[ $name_length -gt MAX_BRANCH_NAME_LENGTH ]]; then
        add_warning "its name is $name_length characters long; the maximum is $MAX_BRANCH_NAME_LENGTH so that deployment subdomains stay within $MAX_SUBDOMAIN_LENGTH characters"
    fi
}

function validate_name_chars() {
    local branch_name=$1

    if [[ $branch_name =~ [A-Z] ]]; then
        add_warning "its name contains uppercase characters, which aren't allowed in subdomains"
    fi

    for character in "${INVALID_CHARS[@]}"; do
        if [[ "$branch_name" == *"$character"* ]]; then
            add_warning "its name contains '$character', which isn't allowed in subdomains"
        fi
    done
}

branch_name=$(get_branch_name)

# Workhorse controls the names of its branches (workhorse/<card-code>), and they aren't used for
# feature deployments, so they're exempt from these checks
if [[ "$branch_name" == workhorse/* ]]; then
    log_success "✔ Workhorse branch, skipping branch name validation"
    exit 0
fi

validate_name_ending "$branch_name"
validate_name_length "$branch_name"
validate_name_chars "$branch_name"

if [[ ${#warnings[@]} -eq 0 ]]; then
    log_success "✔ Branch name is valid!"
    exit 0
fi

# Branch name problems only affect feature deployments, so report them without failing the build
for warning in "${warnings[@]}"; do
    log_warn "⚠ $warning"
    if [[ "$GITHUB_ACTIONS" == "true" ]]; then
        echo "::warning::$warning"
    fi
done
exit 0
