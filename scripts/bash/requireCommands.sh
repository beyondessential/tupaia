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

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
. "$script_dir/ansiControlSequences.sh"

arg_count=${#@}
if ((arg_count == 0)); then
	this_script=$(basename "${BASH_SOURCE[0]}")
	echo -en "${BOLD}${YELLOW}Missing arguments.${RESET} " >&2
	echo -e "${BOLD}$this_script${RESET} was called with no arguments, which does nothing. Example usage:" >&2
	echo >&2
	echo -e "  ${GREEN}path/to/$this_script ${BLUE}readarray python3 yarn${RESET}" >&2
	exit 2
fi

readarray -t required < <(printf "%s\n" "$@" | sort)

any_missing=0
for cmd in "${required[@]}"; do
	if ! command -v "$cmd" >/dev/null; then
		any_missing=1
		break
	fi
done

# Short-circuit with silent output on success
if ((any_missing == 0)); then
	exit 0
fi

# Subsequent outputs to stderr
exec 1>&2

summary='' # Table in CSV format
for cmd in "${required[@]}"; do
	if executable=$(command -v "$cmd"); then
		if [[ $(type -t "$cmd") = builtin ]]; then
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

echo -e "${BOLD}${RED}Missing commands.${RESET} To run this script, ensure the following commands are available:"
echo
echo -e "$summary" |
	column -t -s , | # Pretty print CSV as table
	sed 's/^/  /'    # Indent by two wordspaces

exit 1
