#!/bin/bash -e

DEPLOYMENT_NAME=$1

RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)
BLUE=$(tput setaf 4)
MAGENTA=$(tput setaf 5)
CYAN=$(tput setaf 6)
WHITE=$(tput setaf 7)
RESET=$(tput sgr0)

# Set bash prompt to have deployment name in it
if [[ $DEPLOYMENT_NAME == "production" ]]; then
  BASH_PROMPT_NAME="PROD"
  BASH_PROMPT_COLOR=$RED
else
  BASH_PROMPT_NAME="${DEPLOYMENT_NAME}"
  BASH_PROMPT_COLOR=$CYAN
fi

# \u = user, \W = current directory
BASH_PROMPT="\\[${GREEN}\\]\\u\\[${MAGENTA}\\]@\\[${$BASH_PROMPT_COLOR}\\]${BASH_PROMPT_NAME}\\[${MAGENTA}\\]:\\[${YELLOW}\\]\\W$ \\[${RESET}\\]"
echo "PS1=\"${BASH_PROMPT}\"" >> $HOME_DIR/.bashrc