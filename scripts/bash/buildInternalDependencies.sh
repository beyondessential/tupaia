#!/bin/bash
DIR=`dirname "$0"`

CONCURRENT_BUILD_BATCH_SIZE=5

concurrent_build_commands=()
for PACKAGE in $(${DIR}/getInternalDependencies.sh); do
  concurrent_build_commands+=("${concurrent_build_commands} \"yarn workspace @tupaia/${PACKAGE} build $1\"") # $1 may pass in --watch
done

echo "Concurrently building internal dependencies in batches of ${CONCURRENT_BUILD_BATCH_SIZE}"
total_commands=${#concurrent_build_commands[@]}
for ((start_index=0; start_index<${total_commands}; start_index+=${CONCURRENT_BUILD_BATCH_SIZE})); do
  echo "yarn concurrently ${concurrent_build_commands[@]:${start_index}:${CONCURRENT_BUILD_BATCH_SIZE}}"
  eval "yarn concurrently ${concurrent_build_commands[@]:${start_index}:${CONCURRENT_BUILD_BATCH_SIZE}}"
done

