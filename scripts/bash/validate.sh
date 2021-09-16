#!/bin/bash -e

DIR=$(dirname "$0")
. ${DIR}/../../packages/devops/scripts/ci/utils.sh

yarn -s workspace @tupaia/devops -s validate-branch-name
yarn -s workspace @tupaia/devops -s validate-tests
if [[ $? > 0 ]]; then
    log_warn "Exclusive (.only) tests found in your code. The CI/CD build will fail if you push those"
fi
