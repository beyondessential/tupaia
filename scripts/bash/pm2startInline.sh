#!/usr/bin/env bash
set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
root_dir=$(realpath -- "$script_dir"/../..)

. "$script_dir/ansiControlSequences.sh"

print_help_message() {
  readarray -t available_stacks < <(
    jq --raw-output 'keys[]' "$root_dir"/packages/devops/configs/server-stacks.json
  )

  echo -e "Usage: ${BOLD}yarn run ${GREEN}start-stack ${BLUE}[stack]${RESET}"

  echo -e "\n${BOLD}AVAILABLE STACKS${RESET}"
  printf "  • %s\n" "${available_stacks[@]}"

  echo -e "\n${BOLD}TIPS${RESET}"
  echo -e "  • Normal PM2 commands work e.g. ${BOLD}yarn pm2 status${RESET}"
  echo '  • Start multiple stacks by calling this command multiple times'
}

suppress_logs=0

while [ "$1" != "" ]; do
  case $1 in
  --)
    shift
    break
    ;;
  -h | --help)
    print_help_message
    exit
    ;;
  -q | --quiet)
    shift
    suppress_logs=1
    ;;
  esac
done

# TODO: Actually adapt behaviour to --quiet flag

yarn pm2 start "$root_dir/packages/devops/configs/pm2/$1.config.js"

cleanup() {
  echo -e "\n${BOLD}${WHITE}${ON_RED}  Stopping...  ${RESET}"
  yarn pm2 delete all
}

trap cleanup EXIT

yarn pm2 logs --lines 0
