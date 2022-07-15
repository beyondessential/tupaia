#!/bin/bash -e

DIR=$(dirname "$0")
. ${DIR}/../../packages/devops/scripts/ci/utils.sh

yarn workspace @tupaia/devops validate-branch-name
yarn workspace @tupaia/devops validate-tests
