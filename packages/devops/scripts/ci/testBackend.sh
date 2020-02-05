#!/bin/bash
DIR=`dirname "$0"`
${DIR}/setupTestDatabase.sh
yarn workspace @tupaia/${CI_PACKAGE} test
