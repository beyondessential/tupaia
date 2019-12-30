#!/usr/bin/env bash

# This file runs on appcenter automated builds, after yarn but before building

# If ios, install pods
if [[ ! -z "$APPCENTER_XCODE_PROJECT" ]]
then
  cd ios
  pod update
  pod install
  cd ..
fi
