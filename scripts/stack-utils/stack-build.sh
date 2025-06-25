#!/usr/bin/env bash
set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
root_dir=$(realpath -- "$script_dir"/../..)
. "$root_dir"/scripts/bash/ansiControlSequences.sh

if ! "$root_dir"/scripts/bash/requireCommands.sh jq node yarn; then
	exit 1
fi

readarray -t available_stacks < <(
	jq --raw-output 'keys[]' "$root_dir"/packages/devops/configs/server-stacks.json
)

print_usage() {
	echo -e "\n${BOLD}USAGE${RESET}"
	echo -e "  ${BOLD}yarn run ${GREEN}stack ${MAGENTA}build${RESET} [${BOLD}-h${RESET}|${BOLD}--help${RESET}] [${BOLD}-a${RESET}|${BOLD}--all${RESET}] [${BOLD}-n${RESET}|${BOLD}--dry-run${RESET}] [${BOLD}--${RESET}] [${UNDERLINE}${BLUE}stack${RESET} ${UNDERLINE}${BLUE}...${RESET}]"
}

print_available_stacks() {
	echo -e "\n${BOLD}AVAILABLE STACKS${RESET}"
	printf "  • %s\n" "${available_stacks[@]}"
}

print_examples() {
	echo -e "\n${BOLD}EXAMPLES${RESET}"
	echo -e "  ${DIM}>${RESET} yarn run ${GREEN}stack ${MAGENTA}build ${BLUE}admin-panel tupaia-web${RESET}"
	echo '    Builds all packages required to run the entire Admin Panel and Tupaia Web server stacks.'
	echo
	echo -e "  ${DIM}>${RESET} yarn run ${GREEN}stack ${MAGENTA}build ${BLUE}--dry-run datatrak${RESET}"
	echo '    Print the command that would be run to build the packages in the Tupaia DataTrak server stack.'
}

print_help() {
	echo -e "${BOLD}stack build${RESET} builds the subtree(s) of dependencies required to run the given server stack(s)."
	print_usage
	print_available_stacks
	print_examples

	if [[ $1 = --concise ]]; then
		return
	fi

	echo -e "\n${BOLD}SEE ALSO${RESET}"
	echo -e "  • ${DIM}$root_dir/scripts/stack-utils/${RESET}stack-list.js"
	echo -e "  • ${DIM}$script_dir/${RESET}buildPackagesByGlob.sh"
}

if (($# == 0)); then
	print_help --concise
	exit 2
fi

while :; do
	case $1 in
	--)
		shift
		break
		;;
	-h | --help)
		print_help
		exit 0
		;;
	-n | --dry-run)
		dry_run=1
		shift
		;;
	-* | --*)
		echo -e "${BOLD}${RED}Unknown option:${RESET} $1"
		exit 1
		;;
	*)
		break
		;;
	esac
done

# TODO: Assert has arguments

is_valid() {
	for available in "${available_stacks[@]}"; do
		if [[ "$available" = "$1" ]]; then
			return 0
		fi
	done
	return 1
}

valid_stacks=()
invalid_stacks=()
for stack in "$@"; do
	if is_valid "$stack"; then
		valid_stacks+=("$stack")
	else
		invalid_stacks+=("$stack")
	fi
done

if ((${#invalid_stacks[@]} > 0)); then
	echo -e "${BOLD}${RED}Usage error.${RESET} The following stacks aren’t available. Please check for typos."
	printf "  • %s\n" "${invalid_stacks[@]}"
	print_available_stacks
	exit 1
fi

package_names_glob=$(node "$root_dir"/scripts/stack-utils/stack-list --as-glob "${valid_stacks[@]}")

if ((dry_run == 1)); then
	# ${parameter@operator} Bash expansion with Q operator
	# See https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html
	echo "yarn run build:from ${package_names_glob@Q}"
	exit
fi

yarn run build:from "$package_names_glob"
