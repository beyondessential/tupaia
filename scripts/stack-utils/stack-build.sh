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

print_available_stacks() {
	echo -e "\n${BOLD}AVAILABLE STACKS${RESET}"
	printf "  • %s\n" "${available_stacks[@]}"
}

while [[ $1 != '' ]]; do
	case $1 in
	--)
		shift
		break
		;;
	-h | --help)
		echo -e "${BOLD}build:stack${RESET} builds the subtree(s) of dependencies required to run the given server stack(s)."

		echo -e "\n${BOLD}USAGE${RESET}"
		echo -e "  ${BOLD}yarn run ${GREEN}build:stack${RESET} [${BOLD}-h${RESET}] [${UNDERLINE}${BLUE}stack${RESET} ${BLUE}...${RESET}]"

		print_available_stacks

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
		echo -e "  • ${DIM}$root_dir/scripts/stack-utils/${RESET}stack-list.js"
		echo -e "  • ${DIM}$script_dir/${RESET}buildPackagesByGlob.sh"

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
		positional_args+=("$1")
		shift
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
for stack in "${positional_args[@]}"; do
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
	echo "yarn run build:from '$package_names_glob'"
	exit
fi

yarn run build:from "$package_names_glob"
