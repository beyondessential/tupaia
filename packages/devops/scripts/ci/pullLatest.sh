#!/bin/bash
if curl --output /dev/null --silent --head --fail $DEPLOYMENT_URL; then
  echo "Deployment for ${CI_BRANCH} exists, updating with latest changes"
  /bin/bash -c "ssh-keyscan -H ${DEPLOYMENT_URL} >> /root/.ssh/known_hosts"
  ssh ubuntu@api.tupaia.org "cd tupaia; git fetch; git checkout ${CI_BRANCH}; git pull; yarn;"
else
  echo "No deployment exists for ${CI_BRANCH}, cancelling update"
fi
