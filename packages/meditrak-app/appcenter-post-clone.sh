#!/usr/bin/env bash

## This file runs on appcenter automated builds

## Move environment variables saved by appcenter as USER-DEFINED_VARIABLE_NAME into .env, ready for react-native-dotenv
echo "Setting up environment variables"
env | grep "USER-DEFINED_.*" | awk -F "USER-DEFINED_" '{print $2}' > .env

## Although appcenter generally automatically installs dependencies, it doesn't handle mono-repo
## internal dependencies (see https://github.com/microsoft/appcenter/issues/278)
## To manage that, we here manually install external deps, build internal deps, then redirect the
## package.json entries to the internal filesystem

# move to the root folder
cd ../..

# install root dependencies
yarn install --ignore-scripts --ignore-engines

# move to meditrak folder
cd packages/meditrak-app

# build internal dependencies of meditrak
../../scripts/bash/buildInternalDependencies.sh --packagePath .

# redirect package.json entries for internal dependencies to look locally
node scripts/fixInternalDepsAppcenter.js

