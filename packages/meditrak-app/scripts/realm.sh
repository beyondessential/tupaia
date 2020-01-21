#!/usr/bin/env bash

ADB=$ANDROID_SDK_ROOT/platform-tools/adb
PACKAGE=com.tupaiameditrak
REMOTE=/data/data/$PACKAGE/files/default.realm

function pull() {
  $ADB pull $REMOTE $1
}

function push() {
  $ADB push $1 $REMOTE
}

# pull
case $1 in
  push)
    push $2;;
  pull)
    pull $2;;
  root)
    $ADB root;;
  *)
    cat << EOF
Meditrak Realm Android Database Backup Tool

Usage:

  $ ./realm.sh pull local.realm
  Copy the realm database from the device to the local filesystem.
  Use for creating a backup or snapshot.

  $ ./realm.sh push local.realm
  Copy the realm database from the local filesystem to the device.
  Use to reset the database to a previous state.

If either command results in permission errors, you may need to tell
adb to reconnect to the device in root mode. This is included for
convenience, just run:

  $ ./realm.sh root

This will just work in the emulator, but if you're using a physical
device it'll have to have its root protections bypassed (which is out
of scope of this tool & this documentation).
EOF
esac

