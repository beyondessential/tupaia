#!/bin/bash

DIR=`dirname "$0"`
. ${DIR}/utils.sh

MAX_LENGTH=56
RESERVED_CHARS=('/' '\' '.' '&' '?')
RESERVED_ENDINGS=(admin aggregation api config export mobile tonga-aggregation www)

branch_name="$CI_BRANCH"
if [[ $branch_name == "" ]]; then
    # Get currently checked out branch
    branch_name=`git rev-parse --abbrev-ref HEAD`
fi

# Validate name length
name_length=${#branch_name}
if [[ $name_length -gt MAX_LENGTH ]]; then
    log_error "❌ Branch name is too long, must be $MAX_LENGTH characters max"
    exit 1;
fi

# Validate characters in name
for character in ${RESERVED_CHARS[@]}
do
    if [[ "$branch_name" == *"$character"* ]]; then
        log_error "❌ Invalid character in branch name: '$character'"
        exit 1;
    fi
done


# Validate name ending
for reserved_ending in ${RESERVED_ENDINGS[@]}
do
    if [[ "$branch_name" == *$reserved_ending ]]; then
        log_error "❌ Invalid branch name ending: '$reserved_ending'"
        exit 1;
    fi
done

log_success "✔ Branch name is valid!"
exit 0;
