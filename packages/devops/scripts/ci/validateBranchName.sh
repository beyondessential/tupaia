#!/bin/bash

DIR=$(dirname "$0")
. ${DIR}/utils.sh

INVALID_CHARS=('/' '\' '.' '&' '?')
RESERVED_NAMES=(e2e)
SUBDOMAIN_SUFFIXES=(admin aggregation api config export lesmis lesmis-api mobile psss psss-api report report-api entity entity-api tonga-aggregation www)

# Branch names are used in AWS EC2 deployments. They are combined with standard suffixes
# to create deployment urls, eg {{branchName}}-tonga-aggregation.tupaia.org
MAX_SUBDOMAIN_LENGTH=64
MAX_SUBDOMAIN_SUFFIX_LENGTH=$(get_max_length "${SUBDOMAIN_SUFFIXES[@]}")
MAX_BRANCH_NAME_LENGTH=$((MAX_SUBDOMAIN_LENGTH - ${MAX_SUBDOMAIN_SUFFIX_LENGTH} - 1)) # Subtract 1 for the connecting `-`

function get_branch_name() {
    local branch_name="$CI_BRANCH"
    if [[ $branch_name == "" ]]; then
        # Get currently checked out branch
        branch_name=$(git rev-parse --abbrev-ref HEAD)
    fi

    echo $branch_name
}

function check_name_is_not_reserved() {
    local branch_name=$1

    for reserved_name in ${RESERVED_NAMES[@]}; do
        if [[ "$branch_name" == "$reserved_name" ]]; then
            log_error "❌ Reserved branch name: '$branch_name'"
            exit 1
        fi
    done
}

function validate_name_ending() {
    local branch_name=$1

    for suffix in ${SUBDOMAIN_SUFFIXES[@]}; do
        if [[ "$branch_name" == *$suffix ]]; then
            log_error "❌ Invalid branch name ending: '$suffix'"
            exit 1
        fi
    done
}

function validate_name_length() {
    local branch_name=$1
    local name_length=${#branch_name}

    if [[ $name_length -gt MAX_BRANCH_NAME_LENGTH ]]; then
        log_error "❌ Branch name is too long, must be $MAX_BRANCH_NAME_LENGTH characters max"
        exit 1
    fi
}

function validate_name_chars() {
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
check_name_is_not_reserved $branch_name
validate_name_ending $branch_name
validate_name_length $branch_name
validate_name_chars $branch_name

log_success "✔ Branch name is valid!"
exit 0
