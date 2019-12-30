#!/bin/bash
# Script for generating and uploading Bugsnag Sourcemaps

source .env
export BUGSNAG_API_KEY
PLATFORMS=("android" "ios")
MINIFIED_URLS=("index.android.bundle" "main.jsbundle")

for i in ${!PLATFORMS[*]}
do
    PLATFORM=${PLATFORMS[$i]}
    MINIFIED_URL=${MINIFIED_URLS[$i]}

    # Generage sourcemap
    react-native bundle \
        --platform $PLATFORM \
        --dev false \
        --entry-file index.$PLATFORM.js \
        --bundle-output $PLATFORM-release.bundle \
        --sourcemap-output $PLATFORM-release.bundle.map

    # Upload sourcemap
    bugsnag-sourcemaps upload \
        --api-key $BUGSNAG_API_KEY \
        --minified-file $PLATFORM-release.bundle \
        --source-map $PLATFORM-release.bundle.map \
        --minified-url $MINIFIED_URL \
        --upload-sources
done
