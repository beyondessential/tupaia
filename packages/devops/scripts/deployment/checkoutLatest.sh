#!/bin/bash -e

# Get latest code and dependencies
echo "Checking out ${BRANCH}, or dev if that doesn't exist"
cd ${HOME_DIRECTORY}
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
yarn install

echo "Checked out latest code"
