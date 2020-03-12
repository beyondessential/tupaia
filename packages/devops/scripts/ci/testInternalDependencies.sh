#!/bin/bash
DIR=`dirname "$0"`
for PACKAGE in $(${DIR}/getInternalDependencies.sh); do
  echo Testing ${PACKAGE}
  if ! yarn workspace @tupaia/${PACKAGE} test; then
    exit 1 # the tests for this internal depencency failed
  fi
done
