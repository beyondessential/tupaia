#!/bin/bash -e

DIR=$(dirname "$0")

CONCURRENT_BUILD_BATCH_SIZE=1

USAGE="Usage: buildInternalDependencies.sh [--watch] [--packagePath]"

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
    build_commands+=("\"NODE_ENV=production yarn workspace @tupaia/${PACKAGE} build $build_args\"")
    build_prefixes+=("${PACKAGE},")
done

if [[ $watch == "true" ]]; then
    echo "Concurrently building and watching all internal dependencies"
    echo "yarn concurrently --names \"${build_prefixes[*]}\" ${build_commands[@]}"
    eval "yarn concurrently --names \"${build_prefixes[*]}\" ${build_commands[@]}"
else
    echo "Concurrently building internal dependencies in batches of ${CONCURRENT_BUILD_BATCH_SIZE}"
    echo "yarn concurrently -m $CONCURRENT_BUILD_BATCH_SIZE --names \"${build_prefixes[*]}\" -k ${build_commands[*]}"
    eval "yarn concurrently -m $CONCURRENT_BUILD_BATCH_SIZE --names \"${build_prefixes[*]}\" -k ${build_commands[*]}"
fi
