#!/bin/bash

PARENT_DIRECTORY=$1
TARGET=$2

mkdir -p /common/$1
cp -r /tupaia/${PARENT_DIRECTORY}/${TARGET} /common/${PARENT_DIRECTORY}/${TARGET}
