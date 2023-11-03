#!/usr/bin/env bash

## This file runs on appcenter automated builds

## Move environment variables saved by appcenter as USER-DEFINED_VARIABLE_NAME into .env, ready for react-native-dotenv
echo "Setting up environment variables"
env | grep "USER-DEFINED_.*" | awk -F "USER-DEFINED_" '{print $2}' > .env

# install nvm, yarn
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# Workaround for meditrak-app needing node v16 but the monorepo using v14
echo "16.20.2" > ../../.nvmrc
nvm install
nvm use
npm install -g yarn

set -x

# install meditrak-app and root (for shared scripts)
SKIP_BUILD_INTERNAL_DEPENDENCIES=true yarn workspaces focus tupaia @tupaia/meditrak-app

# build meditrak-app deps
yarn workspace @tupaia/access-policy build-dev
yarn workspace @tupaia/expression-parser build-dev

## Appcenter does not support yarn workspaces (https://github.com/microsoft/appcenter/issues/278)
## Workaround: symlink npm to echo so it doesnt run (appcenter will call `npm install` -> `echo install`)
ln -sf $(which echo) $(which npm)