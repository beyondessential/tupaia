#!/bin/bash
DIR=`dirname "$0"`
for PACKAGE in $(${DIR}/getInternalDependencies.sh); do
  # skip database package - it gets tested separately
  if [[ "$PACKAGE" == "database" ]]; then
    continue
  fi
  echo Testing ${PACKAGE}
  if ! yarn workspace @tupaia/${PACKAGE} test; then
    exit 1 # the tests for this internal depencency failed
  fi
done
