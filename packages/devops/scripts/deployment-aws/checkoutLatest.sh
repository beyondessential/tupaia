#!/usr/bin/env bash
set -e

# Get latest code and dependencies
DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
TUPAIA_DIR=$DIR/../../../..
BRANCH=$1
echo "Checking out ${BRANCH}, or dev if that doesn't exist"
cd ${TUPAIA_DIR}
BRANCH_ON_REMOTE=$(git ls-remote --heads origin ${BRANCH})
if [[ $BRANCH_ON_REMOTE == *${BRANCH} ]]; then
  echo "${BRANCH} exists"
  BRANCH_TO_USE=${BRANCH}
else
  echo "${BRANCH} does not exist, defaulting to dev"
  BRANCH_TO_USE="dev"
fi
git remote set-branches --add origin ${BRANCH_TO_USE}
git fetch --all --prune
git reset --hard # clear out any manual changes that have been made, which would cause checkout to fail
git checkout ${BRANCH_TO_USE}
git reset --hard origin/${BRANCH_TO_USE}

echo 'Checked out latest code'
