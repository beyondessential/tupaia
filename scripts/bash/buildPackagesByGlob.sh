#!/usr/bin/env bash
set -e

DIR=$(dirname "$0")
source "$DIR/ansiControlSequences.sh"

EXAMPLE_USAGE="${BOLD}yarn run build:only '{datatrak-*,types}'${RESET}"
TIP="💡 ${GREEN}Remember to escape (or quote) the glob, so it isn’t expanded by your CLI.${RESET}"

GLOB=$1
if [[ $GLOB = '' ]]; then
	echo -e "${BOLD}${RED}Nothing to build.${RESET} Please provide a glob by which to match package names. For example:"
	echo
	echo -e "  $EXAMPLE_USAGE"
	echo
	echo -e "$TIP"

	exit 1
fi

if [[ $2 != '' ]]; then
	echo -en "${BOLD}${YELLOW}Too many arguments:${RESET} ${BLUE}$@${RESET}. "
	echo 'Did you forget to escape (or quote) your glob? Example usage:'
	echo
	echo -e "  $EXAMPLE_USAGE"
	echo
	echo -e "$TIP"

	exit 1
fi

set -x

yarn workspaces foreach -ptv --jobs unlimited --include "@tupaia/$GLOB" run build
