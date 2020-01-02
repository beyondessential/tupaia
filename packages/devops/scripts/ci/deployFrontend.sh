if [[ $CI_BRANCH == "master" ]];then
   DEPLOYMENT_URL="tupaia.org"
else
   DEPLOYMENT_URL="${CI_BRANCH}.tupaia.org"
fi

if curl --output /dev/null --silent --head --fail $DEPLOYMENT_URL; then
  echo "Deployment for ${CI_BRANCH} exists, updating with latest changes"
  /bin/bash -c "ssh-keyscan -H ${DEPLOYMENT_URL} >> /root/.ssh/known_hosts"
  ssh ubuntu@$DEPLOYMENT_URL 'cd tupaia; git fetch; git checkout ${CI_BRANCH}; git pull; yarn; yarn build-${CI_PACKAGE};'
else
  echo "No deployment exists for ${CI_BRANCH}, cancelling update"
  echo $DEPLOYMENT_URL
fi
