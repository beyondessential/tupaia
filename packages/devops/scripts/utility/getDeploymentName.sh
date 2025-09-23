#!/usr/bin/env bash
set -e +x

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

deployment_name=$("$script_dir"/getEC2TagValue.sh DeploymentName)

# Branch names should be lowercase (see /packages/devops/scripts/ci/validateBranchName.sh), but
# this is only enforced when deployed by /packages/devops/scripts/ci/triggerRedeploy.sh, which is
# guarded by CI. Nevertheless, it should be exceedingly unlikely for DeploymentName to be ‘None’.
if (($? != 0)) || [[ $deployment_name = None ]]; then
  source "$script_dir"/../../../../scripts/bash/ansiControlSequences.sh
  {
    echo -en "${BOLD}${YELLOW}getEC2TagValue error.${RESET} "
    echo -e "Couldn’t fetch this instance’s ${BOLD}DeploymentName${RESET} tag."
  } >&2
  exit 1
fi

echo "$deployment_name"
