#!/bin/bash

# Exit when any command fails
set -e

##
# usage:
# $1 - port to run babel inspector on
# $2 - optionally provide '-s' or '--skip-internal' to skip the build and watch of internal dependencies
##

DIR=`dirname "$0"`
watch_flags=""
start_server="nodemon -w src --exec \"babel-node src/index.ts --inspect=${1} --config-file '../../.babelrc-ts.js'\""

echo "Starting server"
if [[ ${2} == '--skip-internal' || ${2} == '-s' ]]; then
  echo "Skipping internal dependency build and watch"
  eval ${start_server}
else
  echo "Internal dependencies are under watch for hot reload (use --skip-internal or -s for faster startup times)"
  for PACKAGE in $(${DIR}/getInternalDependencies.sh); do
    watch_flags="${watch_flags} --watch ../${PACKAGE}/dist"
  done
  # add the watch flags to the server start process, as well as a 1 second delay to debounce the
  # many restarts that otherwise happen during the initial build of internal dependencies
  start_server="${start_server} --delay 1 ${watch_flags}"
  yarn concurrently "${DIR}/buildInternalDependencies.sh --watch --withTypes" "eval ${start_server}"
fi
