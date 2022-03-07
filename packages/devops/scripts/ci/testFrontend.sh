#!/bin/bash -e
DIR=$(dirname "$0")
PACKAGE=$1
yarn workspace @tupaia/${PACKAGE} test
