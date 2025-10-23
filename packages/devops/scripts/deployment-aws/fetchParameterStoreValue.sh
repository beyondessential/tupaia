#!/usr/bin/env bash
# RELEVANT LINKS
#   - https://console.aws.amazon.com/systems-manager/parameters
#   - https://docs.aws.amazon.com/cli/latest/reference/ssm/get-parameter.html

set -e +x

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
. "$script_dir/../../../../scripts/bash/ansiControlSequences.sh"

if (($# == 0)); then
	this_script=$(basename "${BASH_SOURCE[0]}")
	{
		echo -en "${BOLD}${RED}Missing argument.${RESET} "
		echo -e "Please specify the name of the parameter to fetch from AWS Systems Manager Parameter Store. Example usage:"
		echo
		echo -e "  ${GREEN}path/to/$this_script ${BLUE}MY_PARAMETER${RESET}"
	} >&2
	exit 2
fi

parameter_name=$1
aws ssm get-parameter \
	--name "$parameter_name" \
	--no-paginate \
	--output text \
	--query Parameter.Value \
	--with-decryption
