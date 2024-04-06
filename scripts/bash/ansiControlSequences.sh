#!/bin/bash

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

if [ "$NO_COLOR" != "" ]; then
    # See https://no-color.org
    export RESET=''
    export BOLD=''
    export UNDERLINE=''
    export BLACK=''
    export RED=''
    export GREEN=''
    export YELLOW=''
    export BLUE=''
    export MAGENTA=''
    export CYAN=''
    export WHITE=''
    export BG_BLACK=''
    export BG_RED=''
    export BG_GREEN=''
    export BG_YELLOW=''
    export BG_BLUE=''
    export BG_MAGENTA=''
    export BG_CYAN=''
    export BG_WHITE=''
else
    export RESET='\033[m'
    export BOLD='\033[1m'
    export UNDERLINE='\033[4m'
    export BLACK='\033[30m'
    export RED='\033[31m'
    export GREEN='\033[32m'
    export YELLOW='\033[33m'
    export BLUE='\033[34m'
    export MAGENTA='\033[35m'
    export CYAN='\033[36m'
    export WHITE='\033[37m'
    export BG_BLACK='\033[40m'
    export BG_RED='\033[41m'
    export BG_GREEN='\033[42m'
    export BG_YELLOW='\033[43m'
    export BG_BLUE='\033[44m'
    export BG_MAGENTA='\033[45m'
    export BG_CYAN='\033[46m'
    export BG_WHITE='\033[47m'
fi

