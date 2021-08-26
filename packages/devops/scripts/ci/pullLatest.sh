#!/bin/bash
set -x
DIR=$(dirname "$0")
if [ -f "/root/tupaia_builds/deployment_exists" ]; then
    echo "Deployment for ${CI_BRANCH} exists, updating with latest changes"
    DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)
    /bin/bash -c "ssh-keyscan -H ${DEPLOYMENT_SSH_URL} >> /root/.ssh/known_hosts"
    ssh -o ServerAliveInterval=15 ubuntu@${DEPLOYMENT_SSH_URL} "
    cd tupaia
    git stash
    git fetch
    git checkout ${CI_BRANCH}
    git fetch --all --prune
    git reset --hard origin/${CI_BRANCH}
    git stash pop
    yarn
  "
else
    echo "No deployment exists for ${CI_BRANCH}, skipping pull latest"
fi
