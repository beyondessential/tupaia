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

print_synopsis() {
	echo -e "${BOLD}stack${RESET} is a small set of convenience commands for working with server stacks in the Tupaia monorepo."
}

print_usage() {
	echo -e "\n${BOLD}USAGE${RESET}"
	echo -e "  yarn run stack [-h | --help]"
	echo -e "  yarn run stack ${UNDERLINE}subcommand${RESET} [-h | --help] ${UNDERLINE}stack...${RESET}"
}

print_subcommands() {
	local command_table="
  ${BOLD}${MAGENTA}list${RESET} ${DIM}${UNDERLINE}stack...${RESET}/List the packages in the named server ${UNDERLINE}stack${RESET}s (or ${BOLD}${MAGENTA}ls${RESET})
  ${BOLD}${MAGENTA}build${RESET} ${DIM}${UNDERLINE}stack...${RESET}/Build the packages in the named server ${UNDERLINE}stack${RESET}s and their dependencies
  ${BOLD}${MAGENTA}start${RESET} ${DIM}${UNDERLINE}stack${RESET}/Start all the servers in the named ${UNDERLINE}stack${RESET} using PM2"
	echo -e "\n${BOLD}SUBCOMMANDS${RESET}"
	echo -e "$command_table" | column -t -s /
}

print_examples() {
	echo -e "\n${BOLD}EXAMPLES${RESET}"
	echo -e "  ${DIM}>${RESET} yarn run ${GREEN}stack ${MAGENTA}build ${BLUE}admin-panel datatrak${RESET}"
	echo -e "  ${DIM}>${RESET} yarn run ${GREEN}stack ${MAGENTA}list ${BLUE}admin-panel datatrak${RESET}"
	echo -e "  ${DIM}>${RESET} yarn run ${GREEN}stack ${MAGENTA}start ${BLUE}admin-panel datatrak${RESET}"
}

print_help() {
	print_synopsis "$@"
	print_usage "$@"

	if [[ $1 = --concise ]]; then
		print_examples "$@"
		echo -e "\nFor more verbose help, use ${BOLD}yarn run stack --help${RESET}.  Each subcommand may also be called with ${BOLD}--help${RESET}."
		return
	fi

	print_subcommands "$@"
	print_examples "$@"
	echo -e "\n${BOLD}SEE ALSO${RESET}"
	echo -e "  • ${DIM}$script_dir/${RESET}$(basename -- "${BASH_SOURCE[0]}")"
}

case "$1" in

# Flag
-h | --help)
	print_help
	;;

# Subcommands
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
	print_help --concise
	exit 1
	;;

esac
