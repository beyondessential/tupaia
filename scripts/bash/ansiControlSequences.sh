#!/usr/bin/env bash
# Defines (and exports) a handful of the more widely supported ANSI control sequences for
# manipulating font and colour when writing to stdout. Honours the NO_COLOR environment variable if
# it is set.
#
# EXAMPLE USAGE
#   source "path/to/ansiControlSequence.sh"
#   echo -e "${BOLD}${WHITE}${ON_RED}ERROR${RESET} File does not exist."
#   printf 'See %bhttp://bes.au%b for more info.\n' "$MAGENTA" "$RESET"
#
# REMARKS
#   - If using echo, remember to use -e. Otherwise, the ANSI codes will be printed literally.
#   - Avoid using variables in the printf format string: https://github.com/koalaman/shellcheck/wiki/SC2059
#
# REFERENCE
#   https://en.wikipedia.org/wiki/ANSI_escape_code

# ANSI control sequences

export CURSOR_UP='\033[A'
export CURSOR_DOWN='\033[B'
export CURSOR_FORWARD='\033[C'
export CURSOR_BACK='\033[D'
export CURSOR_NEXT_LINE='\033[E'
export CURSOR_PREV_LINE='\033[F'
export CURSOR_START_OF_LINE='\033[G'
export CLEAR_LINE="\033[2K${CURSOR_START_OF_LINE}"

# Select graphic rendition (SGR) parameters

# Print colour only if outputting to a terminal, and NO_COLOR is unset (see https://no-color.org)
if [[ ! -t 1 || $NO_COLOR != '' ]]; then
	export RESET=''
	export BOLD=''
	export DIM=''
	export ITALIC=''
	export UNDERLINE=''
	export BLACK=''
	export RED=''
	export GREEN=''
	export YELLOW=''
	export BLUE=''
	export MAGENTA=''
	export CYAN=''
	export WHITE=''
	export ON_BLACK=''
	export ON_RED=''
	export ON_GREEN=''
	export ON_YELLOW=''
	export ON_BLUE=''
	export ON_MAGENTA=''
	export ON_CYAN=''
	export ON_WHITE=''
else
	export RESET='\033[m'
	export BOLD='\033[1m'
	export DIM='\033[2m'    # Less widely supported
	export ITALIC='\033[3m' # Less widely supported
	export UNDERLINE='\033[4m'
	export BLACK='\033[30m'
	export RED='\033[31m'
	export GREEN='\033[32m'
	export YELLOW='\033[33m'
	export BLUE='\033[34m'
	export MAGENTA='\033[35m'
	export CYAN='\033[36m'
	export WHITE='\033[37m'
	export ON_BLACK='\033[40m'
	export ON_RED='\033[41m'
	export ON_GREEN='\033[42m'
	export ON_YELLOW='\033[43m'
	export ON_BLUE='\033[44m'
	export ON_MAGENTA='\033[45m'
	export ON_CYAN='\033[46m'
	export ON_WHITE='\033[47m'
fi
