#!/usr/bin/env bash

# This file runs on appcenter automated builds
# Dependencies will be installed using yarn automatically by appcenter

# Use more recent node version than default in the appcenter build servers
set -ex
brew uninstall node@6
NODE_VERSION="8.10.0"
curl "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}.pkg" > "$HOME/Downloads/node-installer.pkg"
sudo installer -store -pkg "$HOME/Downloads/node-installer.pkg" -target "/"

# Move environment variables saved by appcenter as USER-DEFINED_VARIABLE_NAME into .env, ready for react-native-dotenv
echo "Setting up environment variables"
env | grep "USER-DEFINED_.*" | awk -F "USER-DEFINED_" '{print $2}' > .env
