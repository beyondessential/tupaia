#!/bin/bash
DIR=$(dirname "$0")
DEPLOYMENT_URL=$(${DIR}/determineDeploymentUrl.sh)
if curl --output /dev/null --silent --head --fail $DEPLOYMENT_URL; then
  echo "Deployment for ${CI_BRANCH} exists, updating with latest changes"
  /bin/bash -c "ssh-keyscan -H ${DEPLOYMENT_URL} >> /root/.ssh/known_hosts"
  ssh ubuntu@${DEPLOYMENT_URL} "
    cd tupaia
    git stash
    git fetch
    git checkout ${CI_BRANCH}
    git fetch --all
    git reset --hard origin/${CI_BRANCH}
    git stash pop
    yarn
  "
else
  echo "No deployment exists for ${CI_BRANCH}, cancelling update"
fi
