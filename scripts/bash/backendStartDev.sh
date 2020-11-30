#!/bin/bash

# Exit when any command fails
set -e

##
# usage:
# $1 - port to run babel inspector on
# Optionally provide '-s' or '--skip-internal' to skip the build and watch of internal dependencies
# Optionally provide '-ts' or '--typescript' to start typescript server

##
USAGE="Usage: backendStartDev babel_port_inspector [-s --skip-internal] [-ts --typescript]"
DIR=$(dirname "$0")
watch_flags=""
skip_internal=false
type_script=false
inspect_port=${1}

# Start server command for JS
start_server="nodemon -w src --exec \"babel-node src --inspect=${inspect_port} --config-file '../../babel.config.json'\""

while [ "$2" != "" ]; do
    case $2 in
    -ts | --typescript)
        type_script=true
        shift
        ;;
    -s | --skip-internal)
        skip_internal=true
        shift
        ;;
    *)
        echo $USAGE
        exit 1
        ;;
    esac
done

# Start server command for TS
if [[ ${type_script} == true ]]; then
    start_server="nodemon -w src -e ts,json --exec \"babel-node --extensions \".ts\" src/index.ts --inspect=${inspect_port} --config-file '../../.babelrc-ts.js'\""
fi

echo "Starting server"

if [[ ${skip_internal} == true ]]; then
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
