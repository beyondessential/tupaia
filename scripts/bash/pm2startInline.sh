#!/bin/bash -e

cd "$(dirname "${BASH_SOURCE[0]}")"


if [ -z "$1" ]; then
  echo "Usage: yarn start-dev <stack>"
  echo ""
  echo "All stacks:"
  ls -1 ../../packages/devops/configs/pm2/ | sed 's|.config.js||g' | grep -v 'base' | awk '$0="  "$0'
  echo ""
  echo "Tips:"
  echo "  - normal pm2 commands work e.g. yarn pm2 status"
  echo "  - start multiple stacks by calling this cmd multiple times"
  exit 1
fi

yarn pm2 start "../../packages/devops/configs/pm2/$1.config.js"

# When user quits logs stop everything
trap "echo Stopping... && yarn pm2 delete all" EXIT

yarn pm2 logs --lines 0
