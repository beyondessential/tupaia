#!/bin/bash

if [[ $CI_BRANCH == "master" ]]; then
    echo "tupaia.org"
else
    echo "${CI_BRANCH}.tupaia.org"
fi
