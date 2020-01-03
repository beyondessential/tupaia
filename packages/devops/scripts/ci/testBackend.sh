#!/bin/bash
DIR=`dirname "$0"`
${DIR}/setupTestData.sh
cd ./packages/${CI_PACKAGE}
yarn migrate
yarn test
