#!/bin/bash
DIR=`dirname "$0"`
for PACKAGE in $(${DIR}/getInternalDependencies.sh); do
  # skip database package - it gets tested separately
  if [[ "$PACKAGE" == "database" ]]; then
    echo "found db"
    continue
  fi
  echo Testing ${PACKAGE}
done


