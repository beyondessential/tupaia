#!/bin/bash -e

ROOT="$(git rev-parse --show-toplevel)"

node ${ROOT}/scripts/node/validateTests
