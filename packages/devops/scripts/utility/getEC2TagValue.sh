#!/usr/bin/env bash
# Given a tag name, prints the value of that tag for the calling EC2 instance. If the tag is
# unavailable, prints ‘None’.
set -e

if (($# != 1)); then
  script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
  source "$script_dir"/../../../../scripts/bash/ansiControlSequences.sh
  this_script=$(basename "${BASH_SOURCE[0]}")
  {
    echo -en "${BOLD}${RED}Usage error.${RESET} "
    echo -e "${BOLD}$this_script${RESET} expects 1 argument, but got $#. Example usage:"
    echo
    echo -e "  ${GREEN}path/to/$this_script ${BLUE}DeploymentName${RESET}"
  } >&2
  exit 2
fi

tag_name=$1
instance_id=$(curl --silent http://instance-data/latest/meta-data/instance-id)

aws ec2 describe-tags \
  --filters "Name=resource-id,Values=$instance_id" "Name=key,Values=$tag_name" \
  --no-cli-pager \
  --output text \
  --query Tags[0].Value
