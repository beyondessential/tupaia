#!/bin/bash

# This is used to copy files from the container they're retrieved or built in, to the same directory
# location on the common volume.
# The rest of the contents of the won't exist in that common volume, just the skeleton directory
# structure required to host the files that need to be passed between steps
# A later container can then use the companion script `copyFromCommonVolume.sh` to sync all of the
# contents of /common into its copy of the repo
# As an example, consider the build process for admin-panel:
# 1. The first step pulls the .env file from LastPass into packages/admin-panel/.env, and then uses
#    this script to copy the .env file into /common/packages/admin-panel/.env
# 2. The build step uses `copyFromCommonVolume.sh` which means the .env file pulled in step 1 exists
#    next to the admin-panel source code in its copy of the repo. It then builds admin-panel, and
#    again uses this script to copy the build folder to /common/packages/admin-panel/build
# 3. Finally, the deployment step uses `copyFromCommonVolume.sh` again to get all of the above into
#    its copy of the repo, ready to deploy

PARENT_DIRECTORY=$1
TARGET=$2

mkdir -p /common/${PARENT_DIRECTORY}
cp -r /tupaia/${PARENT_DIRECTORY}/${TARGET} /common/${PARENT_DIRECTORY}/${TARGET}
