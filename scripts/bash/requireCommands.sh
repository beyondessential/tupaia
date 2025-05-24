#!/usr/bin/env bash
# Asserts that all of the passed arguments are available as shell commands. On success, exits with
# code 0 and outputs nothing. On failure, prints a summary of which commands are available (and
# their paths), and which commands couldn’t be found.
#
# EXAMPLE USAGE
#   path/to/requireCommands.sh echo jq python3
#
# EXAMPLE OUTPUT
#   ✓  echo     shell builtin
#   ×  jq       not found
#   ✓  python3  /opt/homebrew/bin/python3
#
# REMARK
#  Can be called with no arguments, but has no effect and exits with code 0.

dir=$(dirname "$0")
. "$dir/ansiControlSequences.sh"

required=($(printf "%s\n" "$@" | sort))

any_missing=0
for cmd in "${required[@]}"; do
	if ! command -v "$cmd" >/dev/null; then
		any_missing=1
		break
	fi
done

# Short-circuit with silent output on success
if (($any_missing == 0)); then
	exit 0
fi

is_builtin() {
	if [[ $(type "$1") = *' is a shell builtin' ]]; then
		return 0
	fi
	return 1
}

summary='' # Table in CSV format
for cmd in "${required[@]}"; do
	if executable=$(command -v "$cmd" 2>&1); then
		if is_builtin "$cmd"; then
			executable='shell builtin'
		fi
		summary+="${BOLD}${GREEN}✓${RESET},"
		summary+="${BOLD}${cmd}${RESET},"
		summary+="${GREEN}${executable}${RESET}\n"
	else
		summary+="${BOLD}${RED}×${RESET},"
		summary+="${BOLD}${cmd}${RESET},"
		summary+="${RED}not found${RESET}\n"
	fi
done

echo -e "${BOLD}${RED}Missing commands.${RESET} To run this script, ensure the following commands are available:" >&2
echo
echo -e "$summary" |
	column -t -s ',' | # Pretty print CSV as table
	sed 's/^/  /'      # Indent by two wordspaces

exit 1
