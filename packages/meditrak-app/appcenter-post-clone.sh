#!/usr/bin/env bash

# This file runs on appcenter automated builds
# Dependencies will be installed using yarn automatically by appcenter

# Move environment variables saved by appcenter as USER-DEFINED_VARIABLE_NAME into .env, ready for react-native-dotenv
echo "Setting up environment variables"
env | grep "USER-DEFINED_.*" | awk -F "USER-DEFINED_" '{print $2}' > .env
