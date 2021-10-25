#!/bin/bash -e

DIR=$(dirname "$0")

CONCURRENT_BUILD_BATCH_SIZE=2

USAGE="Usage: buildInternalDependencies.sh [--watch] [--withTypes] [--packagePath]"

OUT_DIR="dist"

watch=false
with_types=false
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
delete_command="rm -rf"

# Build dependencies
# a BUILD_LIBRARY flag is added for packages that have both an app build and a library build
for PACKAGE in $(${DIR}/getInternalDependencies.sh ${package_path}); do
    delete_command="${delete_command} packages/${PACKAGE}/${OUT_DIR}"
    build_commands+=("\"BUILD_LIBRARY=true yarn workspace @tupaia/${PACKAGE} build $build_args\"")
done

if [[ $watch == "true" ]]; then
    echo "Concurrently building and watching all internal dependencies"
    echo "yarn concurrently ${build_commands[@]}"
    eval "yarn concurrently ${build_commands[@]}"
else
    echo "Deleting existing internal dependency builds"
    echo "${delete_command}"
    eval "${delete_command}"

    echo "Concurrently building internal dependencies in batches of ${CONCURRENT_BUILD_BATCH_SIZE}"
    total_build_commands=${#build_commands[@]}
    for ((start_index = 0; start_index < ${total_build_commands}; start_index += ${CONCURRENT_BUILD_BATCH_SIZE})); do
        echo "yarn concurrently ${build_commands[@]:${start_index}:${CONCURRENT_BUILD_BATCH_SIZE}}"
        eval "yarn concurrently ${build_commands[@]:${start_index}:${CONCURRENT_BUILD_BATCH_SIZE}}"
    done
fi
