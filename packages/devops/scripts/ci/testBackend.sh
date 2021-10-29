#!/bin/bash -e
DIR=$(dirname "$0")
${DIR}/copyInEnvironmentVariables.sh
${DIR}/setupTestDatabase.sh
PACKAGE=$1
yarn workspace @tupaia/${PACKAGE} test
