#!/usr/bin/env bash

# Preflight

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
root_dir=$(realpath -- "$script_dir"/../..)

if ! "$root_dir"/scripts/bash/requireCommands.sh \
	jq \
	node \
	yarn \
	"$script_dir"/stack-build.sh; then
	exit 1
fi

root_dir=$(realpath -- "$script_dir"/../..)
. "$root_dir"/scripts/bash/ansiControlSequences.sh

print_help_message() {
	command_table="
  ${BOLD}${MAGENTA}list${RESET}/List the packages in the named server stacks (or ${BOLD}${MAGENTA}ls${RESET})
  ${BOLD}${MAGENTA}build${RESET}/Build the packages in the named server stacks and their dependencies
  ${BOLD}${MAGENTA}start${RESET}/Start all the servers in the named stack using PM2
"

	echo -e "${BOLD}stack${RESET} is a small set of convenience commands for working with server stacks in the Tupaia monorepo."
	echo
	echo -e "$command_table" | column -t -s /
	echo
	echo -e "All these commands may be called with ${BOLD}--help${RESET}"
}

case "$1" in

# Flag
-h | --help)
	print_help_message
	;;

# Commands
list | ls)
	shift
	node "$script_dir"/stack-list "$@" "${valid_stacks[@]}"
	exit
	;;
build)
	shift
	"$script_dir"/stack-build.sh "$@" "${valid_stacks[@]}"
	exit
	;;
start)
	shift
	"$root_dir"/scripts/bash/pm2startInline.sh "$@"
	exit
	;;

# Missing command
*)
	print_help_message
	exit 1
	;;

esac
