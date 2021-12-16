#!/bin/bash -ex

PACKAGES="admin-panel-server entity-server lesmis lesmis-server meditrak-server psss psss-server report-server web-config-server web-frontend"

CONCURRENT_BUILD_BATCH_SIZE=20

build_commands=()

# Build dependencies
for PACKAGE in $PACKAGES; do
    build_commands+=("\"yran workspace @tupaia/${PACKAGE} build\"")
done

eval "yarn concurrently -m $CONCURRENT_BUILD_BATCH_SIZE --prefix -k ${build_commands[*]}"