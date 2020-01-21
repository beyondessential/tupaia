#!/bin/bash

reserved_endings=(api config export mobile admin www)

for reserved_ending in ${reserved_endings[@]}
do
    if [[ "$CI_BRANCH" == *$reserved_ending ]]; then
        echo "Invalid branch name, must not end in '$reserved_ending'"
        exit 1;
    fi
done
