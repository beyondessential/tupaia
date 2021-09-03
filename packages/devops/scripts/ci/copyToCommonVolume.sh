#!/bin/bash

PARENT_DIRECTORY=$1
TARGET=$2

mkdir -p /common/${PARENT_DIRECTORY}
cp -r /tupaia/${PARENT_DIRECTORY}/${TARGET} /common/${PARENT_DIRECTORY}/${TARGET}
