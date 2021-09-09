#!/bin/bash
DIR=$(dirname "$0")
PACKAGE=$1
yarn workspace "@tupaia/${PACKAGE}" test-e2e --ciBuildId $CI_BUILD_ID
