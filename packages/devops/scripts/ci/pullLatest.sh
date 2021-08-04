#!/bin/bash
set -x
DIR=$(dirname "$0")
DEPLOYMENT_SSH_URL=$(${DIR}/determineDeploymentSshUrl.sh)
DEPLOYMENT_URL=$DEPLOYMENT_SSH_URL # ssh url will resolve to tupaia web frontend desktop over HTTP
if curl --output /dev/null --silent --head --fail $DEPLOYMENT_URL; then
    echo "Deployment for ${CI_BRANCH} exists, updating with latest changes"
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
    echo "No deployment exists for ${CI_BRANCH}, cancelling update"
fi
