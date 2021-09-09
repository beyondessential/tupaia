#!/usr/bin/env bash

# This file runs on appcenter automated builds, after yarn but before building

if [[ ! -z "$APPCENTER_XCODE_PROJECT" ]]; then
  # on ios, install pods
  cd ios
  pod update
  pod install
  cd ..
else
  # on android, set up gradle.properties
  mv android/appcenter-gradle.properties android/gradle.properties
fi
