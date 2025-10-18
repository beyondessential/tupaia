#!/usr/bin/env bash
# Usage:
# $1 - port to run babel inspector on
# Optionally provide '-i' or '--include-internal' to include build and watching internal dependencies
# Optionally provide '-ts' or '--typescript' to start typescript server

set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
. "$script_dir/ansiControlSequences.sh"

watch_flags=''
include_internal=false
type_script=false
inspect_port=$1

# Start server command for JS
start_server=nodemon -w src --exec "babel-node src --inspect=${inspect_port@Q} --config-file '../../babel.config.json'"

while [[ $2 != '' ]]; do
    case $2 in
    -ts | --typescript)
        type_script=true
        shift
        ;;
    -i | --include-internal)
        include_internal=true
        shift
        ;;
    *)
        echo -e "Usage: ${BOLD}backendStartDev babel_port_inspector${RESET} [${BOLD}-i${RESET}|${BOLD}--include-internal${RESET}] [${BOLD}-ts${RESET}|${BOLD}--typescript${RESET}]"
        exit 1
        ;;
    esac
done

# Start server command for TS
if [[ $type_script = true ]]; then
    start_server="nodemon --watch src -e ts,json,js --exec node --inspect=${inspect_port@Q} -r ts-node/register src/index.ts"
fi

echo -e "${BOLD}Starting server...${RESET}"

# If internal dependencies are included, add them to the watch list. This will watch for changes to the dist folder of each internal dependency. If the internal dependency then gets rebuilt, the server will restart.
if [[ $include_internal = true ]]; then
    echo 'Internal dependencies are under watch for hot reload'
    for package in $("$DIR"/getInternalDependencies.sh); do
        dist_path=../$package/dist
        watch_flags+=" --watch ${dist_path@Q}"
    done
    # add the watch flags to the server start process, as well as a 1 second delay to debounce the
    # many restarts that otherwise happen during the initial build of internal dependencies
    start_server+=" --delay 1 $watch_flags"
else
    echo -e "Starting server without internal dependency build and watch. To include internal dependencies, add the ${BOLD}-i${RESET} flag."
fi

eval "$start_server"
