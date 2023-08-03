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

  # Remove broken version of react-native-qr-code-scanner
  echo "Removing react-native-qrcode-scanner permissions version"
  ls node_modules/react-native-qrcode-scanner/*
  rm -rf node_modules/react-native-qrcode-scanner/node_modules/react-native-permissions

  # install ndk 21.0.6113669 as it's required by realm (https://github.com/realm/realm-js/issues/4740)
  SDKMANAGER=$ANDROID_HOME/tools/bin/sdkmanager
  #  `grep -v = || true` used to hide unnecessary huge output (https://stackoverflow.com/a/52464819)
  echo y | $SDKMANAGER "ndk;21.0.6113669" | grep -v = || true
fi
