#!/usr/bin/env bash

# This file runs on appcenter automated builds

# Move environment variables saved by appcenter as USER-DEFINED_VARIABLE_NAME into .env, ready for react-native-dotenv
echo "Setting up environment variables"
env | grep "USER-DEFINED_.*" | awk -F "USER-DEFINED_" '{print $2}' > .env

#!/usr/bin/env bash

# move to the root folder
cd ../..

# install dependencies & build internal dependencies
yarn

# move to native folder and fix local dependencies
cd packages/meditrak-app && node scripts/fixLocalDepsForAppcenter.js

