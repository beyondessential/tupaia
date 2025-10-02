#!/usr/bin/env bash

# Preflight
set -e
DIR=$(dirname "$0")
source "$DIR/ansiControlSequences.sh"

# One flag and one “real” argument expected (except in the case of --help)
FLAG=$1
GLOB=$2

# Constants
THIS_SCRIPT=$(basename "$0")
TIP="💡 ${GREEN}Remember to escape (or quote) the glob, so it isn’t expanded by your CLI.${RESET}"

# Helper functions

echo_usage() {
	echo -e "${BOLD}USAGE${RESET}"
	echo -e "  > ${BOLD}yarn run ${GREEN}build:from${RESET} ${BOLD}${BLUE}<escaped glob>${RESET}"
	echo -e "    yarn workspaces foreach -Rptvv -j unlimited --from '@tupaia/${BLUE}<escaped glob>${RESET}' run build"
	echo
	echo -e "  > ${BOLD}yarn run ${GREEN}build:only${RESET} ${BOLD}${BLUE}<escaped glob>${RESET}"
	echo -e "    yarn workspaces foreach -Wptvv -j unlimited --include '@tupaia/${BLUE}<escaped glob>${RESET}' run build"
	echo
	echo -e "${BOLD}REMARKS${RESET}"
	echo '  • You should omit the “@tupaia/” prefix from your pattern.'
	echo -e "  • Documentation for ${BOLD}yarn workspaces foreach${RESET} is at ${MAGENTA}https://yarnpkg.com/cli/workspaces/foreach${RESET}."
}

echo_examples() {
	echo -e "${BOLD}EXAMPLES${RESET}"
	echo -e "  > yarn run ${GREEN}build:from ${BLUE}central-server${RESET}"
	echo -e "    Builds ${YELLOW}@tupaia/central-server${RESET} and its dependencies."
	echo
	echo -e "  > yarn run ${GREEN}build:from ${BLUE}'tupaia-web{,-server}'${RESET}"
	echo -e "    Builds ${YELLOW}@tupaia/tupaia-web${RESET} and ${YELLOW}@tupaia/tupaia-web-server${RESET}, and their dependency trees."
	echo
	echo -e "  > yarn run ${GREEN}build:only ${BLUE}database${RESET}"
	echo '    Equivalent to `yarn workspace @tupaia/database run build`.'
	echo
	echo -e "  > yarn run ${GREEN}build:only ${BLUE}'{datatrak-*,types}'${RESET}"
	echo -e "    Builds ${YELLOW}@tupaia/types${RESET} first (it’s a dependency of the others), then ${YELLOW}@tupaia/datatrak-web${RESET} and ${YELLOW}@tupaia/datatrak-web-server${RESET} in parallel."
}

echo_help_message() {
	MANIFEST_FILE=$(realpath "$DIR/../../package.json")
	echo -en "${BOLD}${THIS_SCRIPT}${RESET} is a convenience script which which thinly wraps two ${BOLD}yarn workspaces${RESET} commands. "
	echo -e "It’s intended to be run as a package script (see ${YELLOW}${MANIFEST_FILE}${RESET})."
	echo
	echo -e "  • ${BOLD}${GREEN}build:from${RESET} builds packages in the monorepo matching the provided pattern, and all their dependencies."
	echo -e "  • ${BOLD}${GREEN}build:only${RESET} builds only packages in the monorepo matching the provided pattern."
	echo
	echo 'In either case, dependencies will be built before dependent packages.'
	echo
	echo_usage
	echo
	echo_examples
}

assert_expected_arguments() {
	if [[ $GLOB = '' ]]; then
		echo -e "${BOLD}${RED}Nothing to build.${RESET} Please provide a glob by which to match package names. For example:"
		echo
		echo -e "  $EXAMPLE_USAGE"
		echo
		echo -e "$TIP"

		exit 1
	fi

	if (($# > 1)); then
		echo -en "${BOLD}${YELLOW}Too many arguments:${RESET} ${BLUE}$@${RESET}. "
		echo 'Did you forget to escape (or quote) your glob? Example usage:'
		echo
		echo -e "  $EXAMPLE_USAGE"
		echo
		echo -e "$TIP"

		exit 1
	fi
}

# The actual script

case $FLAG in
-f | --from)
	shift
	EXAMPLE_USAGE="${BOLD}yarn run build:from 'tupaia-web{,-server}'${RESET}" \
		assert_expected_arguments "$@"
	set -x
	yarn workspaces foreach -Rptvv --jobs unlimited --from "@tupaia/$GLOB" run build
	;;
-o | --only)
	shift
	EXAMPLE_USAGE="${BOLD}yarn run build:only '{datatrak-*,types}'${RESET}" \
		assert_expected_arguments "$@"
	set -x
	yarn workspaces foreach -Wptvv --jobs unlimited --include "@tupaia/$GLOB" run build
	;;
-h | --help)
	echo_help_message
	exit
	;;
*)
	echo -e "${BOLD}${RED}Usage error:${RESET} Neither ${BOLD}--from${RESET} nor ${BOLD}--only${RESET} flag provided. If you invoked $THIS_SCRIPT directly, consider running the ${BOLD}build:from${RESET} or ${BOLD}build:only${RESET} package script via Yarn instead."
	echo
	echo_help_message
	exit 1
	;;
esac
