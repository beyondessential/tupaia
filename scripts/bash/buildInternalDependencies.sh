#!/usr/bin/env bash
set -e

DIR=$(dirname "$0")

CONCURRENT_BUILD_BATCH_SIZE=1
CONCURRENTLY_BIN="${DIR}/../../node_modules/.bin/concurrently"

USAGE="Usage: \033[1mbuildInternalDependencies.sh\033[m [\033[1m--watch\033[m] [\033[1m--packagePath\033[m|\033[1m-p\033[m]"

watch=false
package_path=""
while [ "$1" != "" ]; do
    case $1 in
    --watch)
        shift
        watch=true
        ;;
    -p | --packagePath)
        shift
        package_path=$1
        shift
        ;;
    -h | --help)
        echo -e "$USAGE\n"
        exit
        ;;
    *)
        echo -e "$USAGE\n"
        exit 1
        ;;
    esac
done

[[ $watch = "true" ]] && build_args="--watch" || build_args=""
[[ $watch = "true" ]] && build_ts_args="--watch --preserveWatchOutput" || build_ts_args=""

build_commands=()
build_prefixes=()

# Build dependencies
for PACKAGE in $(${DIR}/getInternalDependencies.sh ${package_path}); do
    build_commands+=("\"NODE_ENV=production yarn workspace @tupaia/${PACKAGE} build-dev $build_args\"")
    build_prefixes+=("${PACKAGE},")
done

if [[ $watch == "true" ]]; then
    echo -e "\033[1mConcurrently building and watching all internal dependencies\033[m"
    echo "> ${CONCURRENTLY_BIN} --names \"${build_prefixes[*]}\" ${build_commands[@]}"
    echo
    eval   "${CONCURRENTLY_BIN} --names \"${build_prefixes[*]}\" ${build_commands[@]}"
else
    echo -e "\033[1mConcurrently building internal dependencies in batches of ${CONCURRENT_BUILD_BATCH_SIZE}\033[m"
    echo "> ${CONCURRENTLY_BIN} -m $CONCURRENT_BUILD_BATCH_SIZE --names \"${build_prefixes[*]}\" -k ${build_commands[*]}"
    echo
    eval   "${CONCURRENTLY_BIN} -m $CONCURRENT_BUILD_BATCH_SIZE --names \"${build_prefixes[*]}\" -k ${build_commands[*]}"
fi
