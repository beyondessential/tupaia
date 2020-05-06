#!/bin/bash
DIR=`dirname "$0"`
for PACKAGE in $(${DIR}/getInternalDependencies.sh); do
  # skip database and auth packages - they get tested separately as they require db access
  if [[ "$PACKAGE" == "database" || "$PACKAGE" == "auth" ]]; then
    continue
  fi
  echo Testing ${PACKAGE}
  if ! yarn workspace @tupaia/${PACKAGE} test; then
    exit 1 # the tests for this internal depencency failed
  fi
done
