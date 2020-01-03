#!/bin/bash
DIR=`dirname "$0"`
${DIR}/waitForPostgres.sh
psql -h db -p 5432 -U postgres -d test -f src/tests/testData/testDataDump.sql
