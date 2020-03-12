#!/bin/bash
DIR=`dirname "$0"`
for PACKAGE in $(${DIR}/getInternalDependencies.sh); do
  echo Buiding ${PACKAGE}
  yarn workspace @tupaia/${PACKAGE} build
done
