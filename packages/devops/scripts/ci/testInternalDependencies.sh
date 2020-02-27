#!/bin/bash
DIR=`dirname "$0"`
for PACKAGE in $(${DIR}/getInternalDependencies.sh); do
  echo Testing ${PACKAGE}
  yarn workspace @tupaia/${PACKAGE} test
done
