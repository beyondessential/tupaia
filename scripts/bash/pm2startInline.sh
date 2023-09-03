#!/bin/bash -e

if [ -z "$1" ]; then
  echo "Usage: $0 <pm2 config file>"
  exit 0
fi

yarn pm2 start $1

# When user quits logs stop everything
trap "echo Stopping... && yarn pm2 stop $1" EXIT

yarn pm2 logs --lines 0
