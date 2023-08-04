#!/bin/bash -e

# Echo date so we can see timezone, see RN-803
date

yarn workspace "@tupaia/e2e" test-e2e --ciBuildId $CI_BUILD_ID
