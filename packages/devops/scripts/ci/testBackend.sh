#!/bin/bash
DIR=`dirname "$0"`
${DIR}/setupTestData.sh
cd ./packages/${CI_PACKAGE}
export DB_NAME=$CI_TEST_DB_NAME
export DB_PASSWORD=$CI_TEST_DB_PASSWORD
export DB_URL=$CI_TEST_DB_URL
export DB_USER=$CI_TEST_DB_USER
yarn migrate
yarn test
