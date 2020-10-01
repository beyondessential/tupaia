#!/bin/bash

DIR=`dirname "$0"`
. ${DIR}/utils.sh

MAX_LENGTH=56
RESERVED_ENDINGS=(api config export mobile admin www)

branch_name="$CI_BRANCH"
if [[ $branch_name == "" ]]; then
    # Get currently checked out branch
    branch_name=`git rev-parse --abbrev-ref HEAD`
fi

# Validate branch name length
name_length=${#branch_name}
if [[ $name_length -gt MAX_LENGTH ]]; then
    log_error "❌ Branch name is too long, must be $MAX_LENGTH characters max"
    exit 1;
fi

# Validate branch name ending
for reserved_ending in ${RESERVED_ENDINGS[@]}
do
    if [[ "$branch_name" == *$reserved_ending ]]; then
        log_error "❌ Invalid branch name ending: '$reserved_ending'"
        exit 1;
    fi
done

log_success "✔ Branch name is valid!"
exit 0;
