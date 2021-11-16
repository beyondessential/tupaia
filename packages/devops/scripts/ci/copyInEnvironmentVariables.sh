#!/bin/bash -e

# So long as setupEnvironmentVariables has run, the common volume "environment_variables"
# will have all .env files in the same directory structure as they're expected within the
# tupaia repo, so we just rsync the whole volume to copy the .env files in

rsync -a /environment_variables/ /tupaia/
