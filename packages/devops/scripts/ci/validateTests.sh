#!/bin/bash -e

DIR=$(dirname "$0")
ROOT="${DIR}/../../../../"

node ${ROOT}/scripts/node/validateTests
