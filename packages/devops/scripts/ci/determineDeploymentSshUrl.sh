#!/bin/bash

if [[ $CI_BRANCH == "master" ]]; then
    echo "ssh.tupaia.org"
else
    echo "${CI_BRANCH}-ssh.tupaia.org"
fi
