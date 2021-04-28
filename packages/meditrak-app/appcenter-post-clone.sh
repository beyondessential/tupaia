#!/usr/bin/env bash

# This file runs on appcenter automated builds

# Move environment variables saved by appcenter as USER-DEFINED_VARIABLE_NAME into .env, ready for react-native-dotenv
echo "Setting up environment variables"
env | grep "USER-DEFINED_.*" | awk -F "USER-DEFINED_" '{print $2}' > .env

#!/usr/bin/env bash

# move to the root folder
cd ../..

# install root dependencies
SKIP_BUILD_INTERNAL_DEPENDENCIES=true yarn install

# move to meditrak folder
cd packages/meditrak-app

# build internal dependencies of meditrak
../../scripts/bash/buildInternalDependencies.sh --packageJsonPath ./package.json

# fix local dependencies
node scripts/fixInternalDepsAppcenter.js

