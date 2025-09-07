#!/usr/bin/env bash

set -e

DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
. "$DIR"/utils.sh

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
    tonga-aggregation
    tupaia-web-api
    www
)

get_max_length() {
    local -i max=0
    for item in "$@"; do
        length=${#item}
        if ((length > $max)); then
            max=$length
        fi
    done
    echo "$max"
}

# Branch names are used in AWS EC2 deployments. They are combined with standard suffixes
# to create deployment urls, eg {{branchName}}-tonga-aggregation.tupaia.org
MAX_SUBDOMAIN_LENGTH=64
MAX_SUBDOMAIN_SUFFIX_LENGTH=$(get_max_length "${SUBDOMAIN_SUFFIXES[@]}")
MAX_BRANCH_NAME_LENGTH=$((MAX_SUBDOMAIN_LENGTH - ${MAX_SUBDOMAIN_SUFFIX_LENGTH} - 1)) # Subtract 1 for the connecting `-`
# As of 11/08/21, MAX_BRANCH_NAME_LENGTH = 64 - 17 - 1 = 46 (Longest subdomain "tonga-aggregation")

validate_name_ending() {
    local branch_name=$1

    for suffix in ${SUBDOMAIN_SUFFIXES[@]}; do
        if [[ "$branch_name" == *$suffix ]]; then
            log_error "❌ Invalid branch name ending: '$suffix'"
            exit 1
        fi
        # api is one of our suffixes so makes sure [branch]-api doesn't match any other api suffixes
        if [[ "$suffix" == *-api && $branch_name-api == *$suffix ]]; then
            log_error "❌ Invalid branch name ending: '$suffix'"
            exit 1
        fi
    done
}

validate_name_length() {
    local branch_name=$1
    local name_length=${#branch_name}

    if [[ $name_length -gt MAX_BRANCH_NAME_LENGTH ]]; then
        log_error "❌ Branch name is too long, must be $MAX_BRANCH_NAME_LENGTH characters max"
        exit 1
    fi
}

validate_name_chars() {
    local branch_name=$1

    if [[ $branch_name =~ [A-Z] ]]; then
        log_error "❌ Branch name cannot contain uppercase characters"
        exit 1
    fi

    for character in ${INVALID_CHARS[@]}; do
        if [[ "$branch_name" == *"$character"* ]]; then
            log_error "❌ Invalid character in branch name: '$character'"
            exit 1
        fi
    done
}

branch_name=$(get_branch_name)
validate_name_ending $branch_name
validate_name_length $branch_name
validate_name_chars $branch_name

log_success "✔ Branch name is valid!"
exit 0
