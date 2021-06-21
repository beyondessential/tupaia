#!/bin/bash
set -x # echo all commands (after private key so it is not exposed) TODO
#set -e # exit if any line fails

# Add SSH key
eval `ssh-agent -s`
echo "${GITHUB_PRIVATE_SSH_KEY}" |  tr -d '"' | sed 's/\\n/\n/g' | ssh-add - > /dev/null

# Read E2E_REFERENCE_BRANCH
#set -o allexport
#source e2e-config.env
#set +o allexport

# Clone reference branch
# TODO: change hardcoded dev to be the actual branch
export GIT_SSH_COMMAND="ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"

git clone --quiet --branch dev --depth=1 git@github.com:beyondessential/tupaia.git /tmp/e2e/reference

ls -lha /tmp/e2e/reference
