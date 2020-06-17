#!/bin/bash
DIR=`dirname "$0"`
${DIR}/setupTestDatabase.sh
PACKAGE=$1
yarn workspace @tupaia/${PACKAGE} test
