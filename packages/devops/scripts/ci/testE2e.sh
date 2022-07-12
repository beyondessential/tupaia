#!/bin/bash -e

yarn workspace "@tupaia/e2e" test-e2e --ciBuildId $CI_BUILD_ID
