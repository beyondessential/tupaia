#!/bin/bash -e

cd "$(dirname "${BASH_SOURCE[0]}")"

if [ -z "$1" ]; then
  echo -e "Usage: \033[1myarn start-stack\033[0m \033[4mstack\033[0m"
  echo    ""
  echo -e "All \033[4mstack\033[0ms:"
  ls -1 ../../packages/devops/configs/pm2/ | sed 's|.config.js||g' | grep -v 'base' | awk '$0="  "$0'
  echo    ""
  echo    "Tips:"
  echo -e "  - Normal PM2 commands work e.g. \033[1myarn pm2 status\033[0m"
  echo    "  - Start multiple stacks by calling this command multiple times"
  exit 1
fi

yarn pm2 start "../../packages/devops/configs/pm2/$1.config.js"

# When user quits logs, stop everything
trap "echo -e '\n\033[1;41;97m  Stopping...  \033[0m' && yarn pm2 delete all" EXIT

yarn pm2 logs --lines 0
