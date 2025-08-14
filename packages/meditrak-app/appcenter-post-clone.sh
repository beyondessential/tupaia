#!/usr/bin/env bash

## This file runs on App Center automated builds

## Move environment variables saved by App Center as USER-DEFINED_VARIABLE_NAME into .env, ready for react-native-dotenv
echo -e "\033[32mSetting up environment variables\033m"
env | grep "USER-DEFINED_.*" | awk -F "USER-DEFINED_" '{print $2}' > .env

# Install nvm, Yarn
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

nvm install
nvm use
npm install -g yarn

set -x

# Install meditrak-app and root (for shared scripts)
yarn workspaces focus tupaia @tupaia/meditrak-app

# Build meditrak-app deps
yarn workspace @tupaia/access-policy build-dev
yarn workspace @tupaia/expression-parser build-dev

## App Center does not support Yarn workspaces (https://github.com/microsoft/appcenter/issues/278)
## Workaround: symlink `npm` to `echo` so it doesnt run (App Center will call `npm install` -> `echo install`)
ln -sf $(which echo) $(which npm)
