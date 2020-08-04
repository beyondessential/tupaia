#!/bin/bash

DIR=`dirname "$0"`

USAGE="Usage: buildInternalDependencies.sh [--watch] [--withTypes]"

watch=false
with_types=false
while [ "$1" != "" ]; do
  case $1 in
      --watch)
        shift
        watch=true
        ;;
      --withTypes)
        shift
        with_types=true
        shift
        ;;
      -h | --help )
        echo -e "$USAGE\n";
        exit
        ;;
      * )
        echo -e "$USAGE\n"
        exit 1
  esac
done

[[ $watch = "true" ]] && build_args="--watch" || build_args=""
[[ $watch = "true" ]] && build_ts_args="--watch" || build_ts_args=""

concurrent_build_commands=""

# Build dependencies
for PACKAGE in $(${DIR}/getInternalDependencies.sh); do
  concurrent_build_commands="${concurrent_build_commands} \"yarn workspace @tupaia/${PACKAGE} build $build_args\""
done

# Build types
if [ $with_types == "true" ]; then
  for PACKAGE in $(${DIR}/getTypedInternalDependencies.sh); do
    concurrent_build_commands="${concurrent_build_commands} \"yarn workspace @tupaia/${PACKAGE} build:ts $build_ts_args\""
  done
fi

echo yarn concurrently ${concurrent_build_commands}
eval "yarn concurrently ${concurrent_build_commands}"
