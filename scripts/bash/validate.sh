#!/bin/bash

set -e

DIR=`dirname "$0"`
. ${DIR}/../../packages/devops/scripts/ci/utils.sh

yarn -s workspace @tupaia/devops -s validate-branch-name

if yarn -s workspace @tupaia/devops -s validate-tests ; then
    :
else
    log_warn "The CI/CD build will fail. Please come back and remove any .only blocks in tests"
fi
