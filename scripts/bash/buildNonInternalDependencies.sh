#!/bin/bash -ex

PACKAGES="report-server admin-panel-server central-server data-table-server datatrak-server datatrak entity-server lesmis lesmis-server meditrak-app-server psss psss-server web-config-server web-frontend"

CONCURRENT_BUILD_BATCH_SIZE=1

build_commands=()
build_prefixes=()

# Build dependencies
for PACKAGE in $PACKAGES; do
    build_commands+=("\"yarn workspace @tupaia/${PACKAGE} build\"")
    build_prefixes+=("${PACKAGE},")
done

eval "yarn concurrently -m $CONCURRENT_BUILD_BATCH_SIZE --names \"${build_prefixes[*]}\" -k ${build_commands[*]}"