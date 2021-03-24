#!/bin/bash

# Get latest code and dependencies
echo "Checking out ${BRANCH}, or dev if that doesn't exist"
cd ${HOME_DIRECTORY}
git fetch --all --prune
git checkout dev # Ensure we have dev as our default, if the specified branch doesn't exist
git reset --hard origin/dev
git checkout $BRANCH # Now try the requested branch
git reset --hard origin/${BRANCH}
yarn install

echo "Checked out latest code"
