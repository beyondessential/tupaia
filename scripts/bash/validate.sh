#!/bin/bash -e

DIR=$(dirname "$0")
. ${DIR}/../../packages/devops/scripts/ci/utils.sh

yarn -s workspace @tupaia/devops -s validate-branch-name
yarn -s workspace @tupaia/devops -s validate-tests
