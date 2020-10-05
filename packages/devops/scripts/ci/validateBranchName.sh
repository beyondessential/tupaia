#!/bin/bash

DIR=`dirname "$0"`
. ${DIR}/utils.sh

MAX_LENGTH=56
INVALID_CHARS=('/' '\' '.' '&' '?')
RESERVED_ENDINGS=(admin aggregation api config export mobile tonga-aggregation www)

function get_branch_name() {
    local branch_name="$CI_BRANCH"
    if [[ $branch_name == "" ]]; then
        # Get currently checked out branch
        branch_name=`git rev-parse --abbrev-ref HEAD`
    fi

    echo $branch_name
}

function validate_name_ending() {
    local branch_name=$1

    for reserved_ending in ${RESERVED_ENDINGS[@]}
    do
        if [[ "$branch_name" == *$reserved_ending ]]; then
            log_error "❌ Invalid branch name ending: '$reserved_ending'"
            exit 1;
        fi
    done
}

function validate_name_length() {
    local branch_name=$1
    local name_length=${#branch_name}

    if [[ $name_length -gt MAX_LENGTH ]]; then
        log_error "❌ Branch name is too long, must be $MAX_LENGTH characters max"
        exit 1;
    fi
}

function validate_name_chars() {
    local branch_name=$1

    if [[ $branch_name =~ [A-Z] ]]; then
        log_error "❌ Branch name cannot contain uppercase characters"
        exit 1;
    fi

    for character in ${INVALID_CHARS[@]}	
    do	
        if [[ "$branch_name" == *"$character"* ]]; then	
            log_error "❌ Invalid character in branch name: '$character'"	
            exit 1;	
        fi
    done
}

branch_name=$(get_branch_name)
validate_name_ending $branch_name
validate_name_length $branch_name
validate_name_chars $branch_name

log_success "✔ Branch name is valid!"
exit 0;
