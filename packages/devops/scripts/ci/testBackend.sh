#!/bin/bash
DIR=`dirname "$0"`
${DIR}/setupTestData.sh
yarn migrate
cd ./packages/${CI_PACKAGE}
yarn test
