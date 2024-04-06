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

## Select graphic rendition (SGR) parameters

if [ "$NO_COLOR" != "" ]; then
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
fi

