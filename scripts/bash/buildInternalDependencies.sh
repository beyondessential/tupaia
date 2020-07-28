#!/bin/bash
DIR=`dirname "$0"`
concurrent_build_commands=""
for PACKAGE in $(${DIR}/getInternalDependencies.sh); do
  concurrent_build_commands="${concurrent_build_commands} \"yarn workspace @tupaia/${PACKAGE} build $1\"" # $1 may pass in --watch
done
echo yarn concurrently ${concurrent_build_commands}
eval "yarn concurrently ${concurrent_build_commands}"
