#!/bin/bash

DIR=`dirname "$0"`
. ${DIR}/utils.sh

RESERVED_ENDINGS=(api config export mobile admin www)

branch_name="$CI_BRANCH"
if [[ $branch_name == "" ]];then
    # Get currently checked out branch
    branch_name=`git rev-parse --abbrev-ref HEAD`
fi

for reserved_ending in ${RESERVED_ENDINGS[@]}
do
    if [[ "$branch_name" == *$reserved_ending ]]; then
        log_error "❌ Invalid branch name ending: '$reserved_ending'"
        exit 1;
    fi
done

log_success "✔ Branch name is valid!"
exit 0;
