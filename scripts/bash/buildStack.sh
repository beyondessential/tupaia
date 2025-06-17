#!/usr/bin/env bash

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
root_dir=$(realpath -- "$script_dir"/../..)
. "$script_dir"/ansiControlSequences.sh

"$script_dir"/requireCommands.sh jq node yarn

stack_definitions=$root_dir/packages/devops/configs/server-stacks.json
readarray -t available_stacks < <(
	jq --raw-output 'keys[]' "$stack_definitions"
)

while getopts h opt; do
	case $opt in
	h)
		echo -e "${BOLD}build:stack${RESET} builds the subtree(s) of dependencies required to run the given server stack(s)."
		echo -e "\n${BOLD}USAGE${RESET}"
		echo -e "  ${BOLD}yarn run ${GREEN}build:stack${RESET} [${BOLD}-h${RESET}] [${UNDERLINE}${BLUE}stack${RESET} ${BLUE}...${RESET}]"

		echo -e "\n${BOLD}AVAILABLE STACKS${RESET}"
		printf "  • %s\n" "${available_stacks[@]}"

		echo -e "\n${BOLD}EXAMPLES${RESET}"
		echo -e "  ${DIM}>${RESET} yarn run ${GREEN}build:stack ${CYAN}-h${RESET}"
		echo '    Prints this help message.'
		echo
		echo -e "  ${DIM}>${RESET} yarn run ${GREEN}build:stack ${BLUE}datatrak${RESET}"
		echo '    Builds all packages required for the entire Tupaia DataTrak server stack.'
		echo
		echo -e "  ${DIM}>${RESET} yarn run ${GREEN}build:stack ${BLUE}admin-panel tupaia-web${RESET}"
		echo '    Builds all packages required to run the entire Admin Panel and Tupaia Web server stacks.'

		echo -e "\n${BOLD}SEE ALSO${RESET}"
		echo -e "  • ${DIM}$root_dir/scripts/node/${RESET}getServerStacks.js"
		echo -e "  • ${DIM}$script_dir/${RESET}buildPackagesByGlob.sh"

		exit 0
		;;
	?)
		exit 1
		;;
	esac
done

for stack in "$@"; do
	# TODO: Assert package is valid
	stacks+=(stack)
done

package_names_glob=$(node "$root_dir/scripts/node/getServerStacks" --as-glob "${stacks[@]}")

yarn run build:from "$package_names_glob"
