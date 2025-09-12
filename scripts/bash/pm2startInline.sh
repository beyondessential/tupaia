#!/usr/bin/env bash
set -e

cd "$(dirname "${BASH_SOURCE[0]}")"
. ./ansiControlSequences.sh

if [[ -z $1 ]]; then
  echo -e "Usage: ${BOLD}yarn start-stack${RESET} ${UNDERLINE}stack${RESET}"
  echo
  echo -e "All ${UNDERLINE}stack${RESET}s:"
  ls -1 ../../packages/devops/configs/pm2/ | sed 's|.config.js||g' | grep -v 'base' | awk '$0=" "$0'
  echo
  echo    "Tips:"
  echo -e "  - Normal PM2 commands work e.g. ${BOLD}yarn pm2 status${RESET}"
  echo    "  - Start multiple stacks by calling this command multiple times"
  exit 1
fi

yarn pm2 start "../../packages/devops/configs/pm2/$1.config.js"

# When user quits logs, stop everything
trap 'echo -e "\n${RED}[start-stack]${RESET} Stopping..." && yarn pm2 delete all' EXIT

yarn pm2 logs --lines 0
